const express=require('express');
const router=express.Router();
const authMiddleware=require('../middlewares/authMiddleware');
const UserModel=require('../models/userModel');
const DoctorModel=require('../models/doctorModel');

router.post('/get-all-users',authMiddleware,async(req,res)=>{
    try {
        const user=await UserModel.findById(req.body.userId);
        if(user?.isAdmin){
            const users=await UserModel.find({});
            res.status(200).json({message:"All users fetched",success:true,data:users})
        }
        else{
            return res.status(200).json({message:"You are not authorized to view this page",success:false});
        }

    } catch (error) {
        console.log(error);
        res.status(400).json({message:"Error fetching users",success:false})

    }
})

router.post('/get-all-doctors',authMiddleware,async(req,res)=>{
    try {
        const user=await UserModel.findById(req.body.userId);
        if(user?.isAdmin){
            const doctors=await DoctorModel.find({});
            res.status(200).json({message:"All doctors fetched",success:true,data:doctors})
        }
        else{
            return res.status(200).json({message:"You are not authorized to view this page",success:false});
        }

    } catch (error) {
        console.log(error);
        res.status(400).json({message:"Error fetching doctors",success:false})

    }
})


router.post('/change-doctor-status',authMiddleware,async(req,res)=>{
    try {
        const {doctorId,status}=req.body;
        const doctor=await DoctorModel.findByIdAndUpdate(doctorId,{status});
        

        const user=await UserModel.findById(doctor.userId);//user corresponding to doctor
        user.isDoctor=status=="approved" ? true : false;

        user.unseenNotifications.push({
            type:'doctorStatus',
            message:`Your doctor account has been ${status}`,
            onClickPath:'/notification'
        })

        await user.save();
        const doctors=await DoctorModel.find({});
        res.status(200).json({message:"Doctor status changed",success:true,data:doctors})

    } catch (error) {
        
    }
})
module.exports=router;