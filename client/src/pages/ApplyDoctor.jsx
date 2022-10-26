import { Button, Col, Form, Input, Row, TimePicker } from "antd";
import axios from "axios";
import React from 'react'
import { useDispatch, useSelector } from "react-redux";
import Layout from '../components/Layout'
import {showLoading,hideLoading} from '../redux/alertSlice';
import {toast} from 'react-hot-toast'
import DoctorForm from "../components/DoctorForm";
import moment from 'moment';

const ApplyDoctor = () => {
    const dispatch = useDispatch();
    const  {user}= useSelector(state => state.user)

    const onFinish =async (values) => {
        try {
            dispatch(showLoading());
            const response=await axios.post('/api/user/apply-doctor-account',{...values,
                userId:user._id,
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
    return (
        <Layout>
            <h1 className='page-title'>Apply Doctor</h1>

            <DoctorForm onFinish={onFinish}/>
        </Layout>
    )
}

export default ApplyDoctor
