const express=require('express');
const router=express.Router();
const authMiddleware=require('../middlewares/authMiddleware');
const UserModel=require('../models/userModel');
const DoctorModel=require('../models/doctorModel');
const AppointmentModel=require('../models/appointmentModel');


router.post('/get-doctor-info-by-user-id',authMiddleware,async(req,res)=>{
    try {
        const doctor=await DoctorModel.findOne({userId:req.body.userId});
        if(!doctor){
            return res.status(200).json({message:"Doctor does not exist",success:false});
        }
        res.status(200).json({message:"Doctor info fetched successfully",success:true,data:doctor._doc});
        
    } catch (error) {
        console.log(error);
        re.status(500).json({message:"Doctor info could not be fetched",success:false});
    }
})

router.post('/get-doctor-info-by-doctor-id',authMiddleware,async(req,res)=>{
    try {
        const doctor=await DoctorModel.findById(req.body.doctorId);
        if(!doctor){
            return res.status(200).json({message:"Doctor does not exist",success:false});
        }
        res.status(200).json({message:"Doctor info fetched successfully",success:true,data:doctor._doc});
        
    } catch (error) {
        console.log(error);
        re.status(500).json({message:"Doctor info could not be fetched",success:false});
    }
})

router.post('/update-doctor-profile',authMiddleware,async(req,res)=>{
    try {
        const doctor=await DoctorModel.findOneAndUpdate({userId:req.body.userId},req.body);
        res.status(200).json({message:"Doctor profile updated successfully",success:true});
        
    } catch (error) {
        console.log(error);
        re.status(500).json({message:"Doctor profile could not be updated",success:false});
    }
})

router.get('/get-appointments-by-doctor-id',authMiddleware,async(req,res)=>{
    try {
        const doctor=await DoctorModel.findOne({userId:req.body.userId});
        const appointments=await AppointmentModel.find({doctorId:doctor._id});
        res.status(200).json({message:"Appointments fetched successfully",success:true,data:appointments});
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Appointments could not be fetched",success:false});
    }

})

router.post('/change-appointment-status',authMiddleware,async(req,res)=>{
    try {
        const appointment=await AppointmentModel.findOneAndUpdate({_id:req.body.appointmentId},{status:req.body.status});

        const doctor=await DoctorModel.findOne({userId:req.body.userId});
        const appointments=await AppointmentModel.find({doctorId:doctor._id});

        const user=await UserModel.findById(appointment.userId);
        user.unseenNotifications.push({
            title:"Appointment Status Changed",
            message:`Your appointment with ${doctor.firstName} ${doctor.lastName} has been ${req.body.status}`,
            data:{
                onClickPath:'/appointments'
            }

        })
        await user.save();
        res.status(200).json({message:"Appointment status changed successfully",success:true,data:appointments});
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Appointment status could not be changed",success:false});
    }

})
module.exports=router;