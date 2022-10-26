const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');
const UserModel = require('../models/userModel');
const DoctorModel = require('../models/doctorModel');
const AppointmentModel = require('../models/appointmentModel');
const moment = require('moment');


router.post('/register', async (req, res) => {
    try {
        const userExists = await UserModel.findOne({ email: req.body.email });
        if (userExists) {
            return res.status(200).json({ message: "User Already Exists", success: false });
        }
        const password = req.body.password;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        req.body.password = hashedPassword;

        const newUser = new UserModel(req.body);
        await newUser.save();
        res.status(200).json({ message: "User created successfully", success: true })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error, success: false });
    }

})

router.post('/login', async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(200).json({ message: "User does not exist", success: false });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(200).json({ message: "Password is incorrect", success: false });
        }
        else {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" }); //payload,secret_key,validation
            res.status(200).json({ message: "Login Successful", success: true, token: token })
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message, success: false })

    }

})

router.post('/get-user-info-by-id', authMiddleware, async (req, res) => {
    try {
        const user = await UserModel.findOne({ _id: req.body.userId });
        if (!user) {
            return res.status(200).json({ message: "User does not exists", success: false });
        }
        else {
            let { password, ...otherDetails } = user._doc;
            res.status(200).json({ success: true, data: otherDetails })
        }

    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Error getting user info", success: false })
    }

})

router.post('/apply-doctor-account', authMiddleware, async (req, res) => {
    try {
        const newDoctor = new DoctorModel(req.body);  //userId
        await newDoctor.save();

        const adminUser = await UserModel.findOne({ isAdmin: true });
        const unseenNotifications = adminUser.unseenNotifications;
        unseenNotifications.push({
            type: "new-doctor-request",
            message: `${newDoctor.firstName} ${newDoctor.lastName}  has applied for doctor account`,
            data: {
                doctorId: newDoctor._id,
                name: newDoctor.firstName + " " + newDoctor.lastName,
                onClickPath: "/admin/doctorslist"
            }
        })
        await UserModel.findOneAndUpdate({ isAdmin: true }, { unseenNotifications: unseenNotifications });
        res.status(200).json({ message: "Doctor account applied successfully", success: true });



    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Error applying for doctor account", success: false })
    }
})

router.post('/mark-all-notifications-as-seen', authMiddleware, async (req, res) => {
    try {
        const user = await UserModel.findById(req.body.userId);
        user.seenNotifications = user.unseenNotifications;
        user.unseenNotifications = [];
        await user.save();


        user.password = undefined;
        res.status(200).json({ message: "All notifications marked as seen", success: true, data: user._doc })
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Error marking notifications as seen", success: false })

    }
})

router.post('/delete-all-notifications', authMiddleware, async (req, res) => {
    try {
        const user = await UserModel.findById(req.body.userId);
        user.seenNotifications = [];
        user.unseenNotifications = [];
        await user.save();

        user.password = undefined;
        res.status(200).json({ message: "All Notifications deleted", success: true, data: user._doc })
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Error deleting notifications", success: false })

    }
})

router.get('/get-all-approved-doctors', authMiddleware, async (req, res) => {
    try {
        const doctors = await DoctorModel.find({ status: "approved" });
        res.status(200).json({ message: "All approved doctors", success: true, data: doctors })
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Error getting all approved doctors", success: false })
    }
})

router.post('/book-appointment', authMiddleware, async (req, res) => {
    try {
        req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
        req.body.time = moment(req.body.time, "HH:mm").toISOString();

        const newAppointment = new AppointmentModel(req.body);
        await newAppointment.save();

        const doctor = await DoctorModel.findById(req.body.doctorId);
        const user = await UserModel.findById(doctor.userId); //user corresponding to doctor

        user.unseenNotifications.push({
            type: "new-appointment",
            message: `New appointment booked by ${req.body.userInfo.name}`,
            data: {
                onClickPath: "/doctor/appointments"
            }
        })
        await user.save();
        res.status(200).json({ message: "Appointment booked successfully", success: true });

    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Error booking appointment", success: false })
    }
})

router.post("/check-booking-availability", authMiddleware, async (req, res) => {
    try {
        const date = moment(req.body.date, "DD-MM-YYYY").toISOString();

        const fromTime = moment(req.body.time, "HH:mm").subtract(1, "hours").toISOString();
        const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();

        const doctorId = req.body.doctorId;
        const appointments = await AppointmentModel.find({
            doctorId,
            date,
            time: { $gte: fromTime, $lte: toTime },
        });
        if (appointments.length > 0) {
            return res.status(200).send({
                message: "Appointments not available",
                success: false,
            });
        } else {
            return res.status(200).send({
                message: "Appointments available",
                success: true,
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error booking appointment",
            success: false,
            error,
        });
    }
});

router.get('/get-appointments-by-userId', authMiddleware, async (req, res) => {
    try {
        const appointments = await AppointmentModel.find({ userId: req.body.userId });
        res.status(200).json({ message: "All appointments", success: true, data: appointments })
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Error getting all appointments", success: false })
    }

})

module.exports = router;