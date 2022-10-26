import axios from 'axios'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DoctorForm from '../../components/DoctorForm'
import Layout from '../../components/Layout'
import { hideLoading, showLoading } from '../../redux/alertSlice'
import { toast } from 'react-hot-toast'
import moment from 'moment';


const Profile = () => {
    const [doctor, setDoctor] = useState(null);
    const {user} = useSelector(state => state.user)
    const dispatch = useDispatch();

    const onFinish =async (values) => {
        try {
            dispatch(showLoading());
            const response=await axios.post('/api/doctor/update-doctor-profile',{...values
                ,userId:user._id,
                timings:[moment(values.timings[0]).format('HH:mm'),moment(values.timings[1]).format('HH:mm')]
            },{
                headers: {
                    Authorization:"Bearer "+localStorage.getItem("token")
                }
            });   
            if(response.data.success){
                toast.success(response.data.message);
            }
            else{
                toast.error(response.data.message);
            }
            dispatch(hideLoading());         
        } catch (error) {
            console.log(error);
            dispatch(hideLoading());
        }

    }
    useEffect(() => {
        const getDoctor = async () => {
            try {
                dispatch(showLoading());
                const response = await axios.post('/api/doctor/get-doctor-info-by-user-id', {}, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                })
                dispatch(hideLoading());
                if (response.data.success) {
                    setDoctor(response.data.data);
                }
            } catch (error) {
                console.log(error);
                dispatch(hideLoading());
            }
        }
        getDoctor();
    }, [])
    return (
        <Layout>
            <h1 className="page-title">Profile</h1>
            {
                doctor && (<DoctorForm onFinish={onFinish} initialValues={doctor}/>)
            }
        </Layout>
    )
}

export default Profile
