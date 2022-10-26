import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../redux/alertSlice'
import ColumnGroup from 'antd/lib/table/ColumnGroup';
import { Col, Row } from 'antd';
import Doctor from '../components/Doctor';
const Home = () => {
    const [doctors, setDoctors] = useState();
    const dispatch = useDispatch(); 
    useEffect(() => {
        const getData=async()=>{
            try {    
                dispatch(showLoading());                                                                       
                const response=await axios.get('/api/user/get-all-approved-doctors',{
                    headers:{
                        Authorization:'Bearer ' + localStorage.getItem('token')
                    }
                })
                if(response.data.success){
                    setDoctors(response.data.data);
                }
                dispatch(hideLoading());
            } catch (error) {
                console.log(error);
                dispatch(hideLoading());
            }
        }
        getData();
    }, [])

    // console.log("doctors",doctors);
    return (
        <Layout>
            <Row gutter={20}>
                {
                    doctors?.map((doctor)=>(
                        <Col span={8} xs={24} sm={24} lg={8} >
                            <Doctor doctor={doctor}/>
                        </Col>
                    ))
                }
            </Row>
        </Layout>
    )
}

export default Home
