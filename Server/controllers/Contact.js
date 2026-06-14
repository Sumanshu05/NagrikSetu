const Contact = require("../models/Contact");

exports.contactUs = async (req, res) => {
  try {
    const { firstName, lastName, email, contactNumber, message } = req.body;

    if (!firstName || !lastName || !email || !contactNumber || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newContact = await Contact.create({
      firstName,
      lastName,
      email,
      contactNumber,
      message,
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: newContact,
    });
  } catch (error) {
    console.log("Error in contactUs controller: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not fetch contact messages",
    });
  }
};
