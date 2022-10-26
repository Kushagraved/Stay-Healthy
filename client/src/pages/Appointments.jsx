import { Table } from 'antd';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import Layout from '../components/Layout'
import { showLoading,hideLoading } from '../redux/alertSlice';
import axios from 'axios'
import moment from 'moment'

const Appointments = () => {
    const [appointments, setAppointments] = useState();

    const dispatch = useDispatch();
    useEffect(() => {
        const getAppointmentsData=async()=>{
            try {
                dispatch(showLoading());
                const response = await axios.get('/api/user/get-appointments-by-userId', {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    }
                });
                dispatch(hideLoading());
                if (response.data.success) {
                    setAppointments([...response.data.data]);
                }
            } catch (error) {
                console.log(error);
                dispatch(hideLoading());
            }
        }
        getAppointmentsData();
    }, [])

    const columns = [
        {
            title: "Id",
            dataIndex: "_id",
        },
        {
            title: "Doctor",
            dataIndex: "name",
            render: (text, record) => (
                <span>
                    {record.doctorInfo.firstName} {record.doctorInfo.lastName}
                </span>
            ),
        },
        {
            title: "Phone",
            dataIndex: "phoneNumber",
            render: (text, record) => (
                <span>
                    {record.doctorInfo.phoneNumber}
                </span>
            ),
        },
        {
            title: "Date & Time",
            dataIndex: "createdAt",
            render: (text, record) => (
                <span>
                    {moment(record.date).format("DD-MM-YYYY")} {moment(record.time).format("HH:mm")}
                </span>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
        }
    ];

    return (
        <Layout>
            <h1 className="page-title">Appointments</h1>
            <hr />
            <Table columns={columns} dataSource={appointments} />
        </Layout>
    )
}

export default Appointments
