import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../components/Layout'
import axios from 'axios';
import { showLoading,hideLoading } from '../../redux/alertSlice';
import {toast} from 'react-hot-toast'
import { Table } from 'antd';
import { setUser } from '../../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const UsersList = () => {
    const {user} = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate=useNavigate();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const getUsersData = async () => {
            try {
                dispatch(showLoading());
                const response = await axios.post('/api/admin/get-all-users',{},{
                    headers:{
                        'Authorization':'Bearer '+localStorage.getItem('token'),
                    }
                });
                dispatch(hideLoading());
                if (response.data.success) {
                    setUsers([...response.data.data]);
                
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
        getUsersData();
    }, [])

    const columns = [
        {
          title: "Name",
          dataIndex: "name",
        },
        {
          title: "Email",
          dataIndex: "email",
        },
        {
          title: "Created At",
          dataIndex: "createdAt",
          render: (record , text) => moment(record.createdAt).format("DD-MM-YYYY"),
        },
        {
          title: "Actions",
          dataIndex: "actions",
          render: (text, record) => (
            <div className="d-flex">
              <h1 className="anchor">Block</h1>
            </div>
          ),
        },
      ];
    
      return (
        <Layout>
          <h1 className="page-header">Users List</h1>
          <hr />
          <Table columns={columns} dataSource={users}/>
        </Layout>
      );
}

export default UsersList
