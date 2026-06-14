const Complaint = require("../models/Complaint");
const User = require("../models/User");
const mongoose = require("mongoose");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/imageUploader");
const { sendNotification } = require("../services/notificationService");

// ─── Create Complaint ─────────────────────────────────────────────────────────
exports.createComplaint = async (req, res) => {
    try {
        const { title, description, category, location, wardId } = req.body;

        if (!title || !description || !category || !location || !wardId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Parse location if sent as JSON string
        const parsedLocation =
            typeof location === "string" ? JSON.parse(location) : location;

        if (
            !parsedLocation?.coordinates ||
            parsedLocation.coordinates.length !== 2
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid coordinates [lng, lat] are required",
            });
        }

        // Duplicate check: same user, same ward, same category, open in last 24h
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const duplicateComplaint = await Complaint.findOne({
            filedBy: req.user.id,
            "location.ward": wardId,
            category,
            status: { $in: ["pending", "assigned", "in_progress"] },
            createdAt: { $gte: since },
        });

        if (duplicateComplaint) {
            return res.status(409).json({
                success: false,
                message: "A similar complaint was already filed recently.",
                complaintId: duplicateComplaint._id,
            });
        }

        // Upload photos if provided
        let photos = [];
        if (req.files && req.files.photos) {
            const filesArray = Array.isArray(req.files.photos)
                ? req.files.photos
                : [req.files.photos];
            photos = await uploadToCloudinary(filesArray, "complaints");
        }

        const complaint = await Complaint.create({
            title,
            description,
            category,
            location: {
                type: "Point",
                coordinates: parsedLocation.coordinates,
                landmark: parsedLocation.landmark || "",
                ward: wardId,
            },
            filedBy: req.user.id,
            photos,
            status: "pending",
            statusHistory: [
                {
                    status: "pending",
                    changedBy: req.user.id,
                    note: "Complaint filed.",
                },
            ],
        });

        // Add to user's complaintsFiled array
        await User.findByIdAndUpdate(req.user.id, {
            $push: { complaintsFiled: complaint._id },
        });

        return res.status(201).json({
            success: true,
            message: "Complaint created successfully",
            data: complaint,
        });
    } catch (error) {
        console.error("createComplaint error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// ─── Get All Complaints (admin/officer — paginated, filtered) ─────────────────
exports.getAllComplaints = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            status,
            ward,
            sortBy = "createdAt",
            order = "desc",
        } = req.query;

        const filter = {};
        if (category) filter.category = category;
        if (status) filter.status = status;
        if (ward) filter["location.ward"] = ward;

        const skip = (Number(page) - 1) * Number(limit);
        const sort = { [sortBy]: order === "asc" ? 1 : -1 };

        const [complaints, total] = await Promise.all([
            Complaint.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .populate("filedBy", "name phoneNumber email")
                .populate("location.ward", "name")
                .lean(),
            Complaint.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: complaints,
        });
    } catch (error) {
        console.error("getAllComplaints error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// ─── Get Nearby Complaints (geo query) ───────────────────────────────────────
exports.getNearbyComplaints = async (req, res) => {
    try {
        const { lng, lat, radius = 2000, status, category } = req.query;

        if (!lng || !lat) {
            return res.status(400).json({
                success: false,
                message: "lng and lat are required",
            });
        }

        const filter = {
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)],
                    },
                    $maxDistance: Number(radius),
                },
            },
        };
        if (status) filter.status = status;
        if (category) filter.category = category;

        const complaints = await Complaint.find(filter)
            .limit(100)
            .populate("location.ward", "name")
            .select("title category status location photos createdAt")
            .lean();

        return res.status(200).json({
            success: true,
            message: "Nearby complaints fetched",
            count: complaints.length,
            data: complaints,
        });
    } catch (error) {
        console.error("getNearbyComplaints error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ─── Get Complaint by ID ──────────────────────────────────────────────────────
exports.getComplaintById = async (req, res) => {
    try {
        const complaintId = req.params.id;

        if (!mongoose.isValidObjectId(complaintId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Complaint ID",
            });
        }

        const complaint = await Complaint.findById(complaintId)
            .populate("filedBy", "name email phoneNumber")
            .populate("assignedTo", "name email")
            .populate("location.ward", "name zone")
            .populate({ path: "statusHistory.changedBy", select: "name role" });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Complaint fetched successfully",
            data: complaint,
        });
    } catch (error) {
        console.error("getComplaintById error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ─── Get My Complaints (citizen) ──────────────────────────────────────────────
exports.getMyComplaints = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const filter = { filedBy: req.user.id };
        if (status) filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);

        const [complaints, total] = await Promise.all([
            Complaint.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("location.ward", "name")
                .lean(),
            Complaint.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            message: "Your complaints fetched successfully",
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total,
            data: complaints,
        });
    } catch (error) {
        console.error("getMyComplaints error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ─── Update Complaint Status (officer/admin) ──────────────────────────────────
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        const VALID_STATUSES = [
            "pending",
            "assigned",
            "in_progress",
            "rejected",
            "escalated",
        ];

        if (!status || !VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
            });
        }

        if (status === "resolved") {
            return res.status(400).json({
                success: false,
                message: "Use PATCH /complaint/:id/resolve to mark as resolved",
            });
        }

        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        complaint.status = status;
        complaint.assignedTo = req.user.id;
        complaint.statusHistory.push({
            status,
            changedBy: req.user.id,
            note: note || "",
            at: new Date(),
        });

        await complaint.save();

        return res.status(200).json({
            success: true,
            message: "Complaint status updated",
            data: complaint,
        });
    } catch (error) {
        console.error("updateComplaintStatus error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ─── Resolve Complaint ────────────────────────────────────────────────────────
exports.resolveComplaint = async (req, res) => {
    try {
        const { note } = req.body;

        if (!req.files || !req.files.closingPhoto) {
            return res.status(400).json({
                success: false,
                message: "A closing photo is required to resolve a complaint.",
            });
        }

        const complaint = await Complaint.findById(req.params.id).populate(
            "filedBy",
            "email name"
        );

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        if (complaint.status === "resolved") {
            return res.status(409).json({
                success: false,
                message: "Complaint is already resolved",
            });
        }

        // Upload closing photo
        const [closingPhoto] = await uploadToCloudinary(
            [req.files.closingPhoto],
            "complaints/closing"
        );

        complaint.status = "resolved";
        complaint.resolvedAt = new Date();
        complaint.closingPhoto = closingPhoto;
        complaint.assignedTo = req.user.id;
        complaint.resolutionNote = note || "Issue resolved.";
        complaint.statusHistory.push({
            status: "resolved",
            changedBy: req.user.id,
            note: note || "Issue resolved.",
            at: new Date(),
        });

        await complaint.save();

        // Notify citizen
        sendNotification({
            to: complaint.filedBy,
            title: "Your complaint has been resolved ✅",
            body: `Complaint "${complaint.title}" has been resolved.`,
            data: { complaintId: complaint._id.toString() },
            type: "complaint_resolved",
        }).catch(console.error);

        return res.status(200).json({
            success: true,
            message: "Complaint resolved successfully",
            data: complaint,
        });
    } catch (error) {
        console.error("resolveComplaint error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ─── Delete Complaint ─────────────────────────────────────────────────────────
exports.deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        // Delete all associated photos from cloudinary
        const allPhotos = [...(complaint.photos || [])];
        if (complaint.closingPhoto?.publicId) {
            allPhotos.push(complaint.closingPhoto);
        }
        await deleteFromCloudinary(allPhotos);

        await complaint.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Complaint deleted successfully",
        });
    } catch (error) {
        console.error("deleteComplaint error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ─── Get Public Stats (ward-level breakdown) ──────────────────────────────────
exports.getPublicStats = async (req, res) => {
    try {
        const stats = await Complaint.aggregate([
            {
                $group: {
                    _id: { ward: "$location.ward", status: "$status" },
                    count: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: "$_id.ward",
                    statusBreakdown: {
                        $push: { status: "$_id.status", count: "$count" },
                    },
                    total: { $sum: "$count" },
                },
            },
            {
                $lookup: {
                    from: "wards",
                    localField: "_id",
                    foreignField: "_id",
                    as: "wardInfo",
                },
            },
            {
                $unwind: { path: "$wardInfo", preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    _id: 0,
                    wardId: "$_id",
                    wardName: "$wardInfo.name",
                    total: 1,
                    statusBreakdown: 1,
                },
            },
            { $sort: { total: -1 } },
        ]);

        return res.status(200).json({
            success: true,
            message: "Public complaint stats",
            data: stats,
        });
    } catch (error) {
        console.error("getPublicStats error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ─── Get Recent Complaints (Public) ──────────────────────────────────────────
exports.getRecentComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("location.ward", "name")
            .select("title category status upVoteCount createdAt location")
            .lean();

        return res.status(200).json({
            success: true,
            data: complaints,
        });
    } catch (error) {
        console.error("getRecentComplaints error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
