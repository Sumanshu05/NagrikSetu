const Review = require("../models/Review");

exports.createReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (!rating || !review) {
      return res.status(400).json({
        success: false,
        message: "Rating and review are required",
      });
    }

    const newReview = await Review.create({
      user: userId,
      rating,
      review,
      role,
    });

    return res.status(200).json({
      success: true,
      message: "Review submitted successfully",
      data: newReview,
    });
  } catch (error) {
    console.log("Error in createReview: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "firstName lastName image name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not fetch reviews",
    });
  }
};
