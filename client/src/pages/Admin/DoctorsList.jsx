import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../components/Layout'
import axios from 'axios';
import { showLoading, hideLoading } from '../../redux/alertSlice';
import { toast } from 'react-hot-toast'
import { Table } from 'antd';
import { setUser } from '../../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const DoctorsList = () => {
    const { user } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        const getDoctorsData = async () => {
            try {
                dispatch(showLoading());
                const response = await axios.post('/api/admin/get-all-doctors', {}, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    }
                });
                dispatch(hideLoading());
                if (response.data.success) {
                    setDoctors([...response.data.data]);

                }
                else {
                    toast.error(response.data.message);
                    dispatch(setUser(null));
                    localStorage.clear();
                    navigate("/login");
                }
            } catch (error) {
                console.log(error);
                dispatch(hideLoading());
            }
        }
        getDoctorsData();
    }, [])
    const changeDoctorStatus = async (record, status) => {
        try {
            dispatch(showLoading());
            const response = await axios.post('/api/admin/change-doctor-status', { doctorId: record._id, status,userId:record.userId }, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                }
            })
            dispatch(hideLoading());
            if (response.data.success) {
                toast.success(response.data.message);
                setDoctors([...response.data.data]);
            }
            else {
                toast.error(response.data.message);
            }

        } catch (error) {
            console.log(error);
            dispatch(hideLoading());
        }
    }

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            render: (text, record) => (
                <span>
                    {record.firstName} {record.lastName}
                </span>
            ),
        },
        {
            title: "Phone",
            dataIndex: "phoneNumber",
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            render: (record, text) => moment(record.createdAt).format("DD-MM-YYYY"),
        },
        {
            title: "status",
            dataIndex: "status",
        },
        {
            title: "Actions",
            dataIndex: "actions",
            render: (text, record) => (

                <div className="d-flex">
                    {record.status === "pending" && (
                        <h1
                            className="anchor"
                        onClick={() => changeDoctorStatus(record, "approved")}
                        >
                            Approve
                        </h1>
                    )}
                    {record.status === "approved" && (
                        <h1
                            className="anchor"
                        onClick={() => changeDoctorStatus(record, "blocked")}
                        >
                            Block
                        </h1>
                    )}
                </div>
            ),
        },
    ];

    return (
        <Layout>
            <h1 className="page-header">Doctors List</h1>
            <hr />
            <Table columns={columns} dataSource={doctors} />
        </Layout>
    );
}

export default DoctorsList
