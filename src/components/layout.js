import React from 'react';
import { Container } from 'react-bootstrap';
import Header from './header';
import Footer from './footer';
import './layout.css';

const Layout = ({ children }) => {
    return (
        <>
            <Header />
            <Container fluid className='body-cont-main'>
                {children}
            </Container>
        </>
    );
};

export default Layout;