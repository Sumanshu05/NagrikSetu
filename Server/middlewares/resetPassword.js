const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//resetpassword token
exports.resetPasswordToken = async(req , res) => {
    try{
        //mail fetch kro req ki body se
        const email = req.body.email;

        //check kro user usse mail se related or email validate kro 
        const user = await User.findOne({email: email});
        if(!user){
            return res.json({
                success: false,
                message: `This Email: ${email} is not Registered with Us , Enter a Valid Email`,
            });
        }

        //genrate krdo token
        const token = crypto.randomBytes(20).toString("hex");

        //update krdo user by adding token and expiration time 
        const updatedDetails = await User.findOneAndUpdate(
            {email: email},
            {
                token: token,
                resetPasswordExpires: Date.now() + 3600000,
            },
            //this will return the new updated doucment 
            {new: true}
        );

        console.log("DETAILS OF THE USER" , updatedDetails);

        //create url for reset
        const url = `${process.env.FRONTEND_URL || "http://localhost:5173"}/update-password/${token}`;


        //email send kro jisme yeh url hoo
        await mailSender(
            email,
            "Password Reset Link",
            `Your Link for email verificatin is ${url}. Please click this url to reset your password`,
        );

        //return krdo response 
        res.json({
            success: false,
            message: 'Email Sent Successfully , Please Check Your Email to Continue Further',
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while reseting the password",
        });
    }
}


//reset password manually
exports.resetPassword = async(req , res) => {
    try{
        //data fetch kro 
        //frontend to add all these details in the req body
        const { password , confirmpassword , token } = req.body;

        //validate kro 
        if(confirmpassword != password){
            return res.json({
                success: false,
                message: 'Passowrd and Confirm Password Does not Match',
            });
        }


        //get kro abh user details from the db using the token 
        const userDetails = await User.findOne({token: token});

        //agar koi entry nhii milti to invalid entry haii
        if(!userDetails){
            return res.json({
                success: false,
                message: 'Token is invalid',
            });
        }

        //token time check kro ki expire too nhii hogya
        if(!(userDetails.resetPasswordExpires > Date.now())){
            return res.status(403).json({
                success: false,
                message: `Token is Expired, Please Regenrate Your Token`,
            });
        }

        //hash krdo password ko 
        const encryptedPassword = await bcrypt.hash(password , 10);

        //password update krdo
        await User.findOneAndUpdate(
            {token: token},
            {password: encryptedPassword},
            {new: true},
        );

        //return krdo response 
        return res.status(200).json({
            success: true,
            message: `Password Reset Successfully`,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `Some Error in Updating the Password`,
        });
    }
}