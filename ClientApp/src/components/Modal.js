import React, { Component } from 'react'
import { Button, Header, Image, Modal } from 'semantic-ui-react'
import Form from './Form'


class ModalExample extends Component {

    constructor(props) {
        super(props);
        this.state = { modalOpen: true }
    }

    handleClose = () => this.setState({modalOpen: false})

    render() {
        return (
            <Modal open={this.state.modalOpen} basic>
                <Modal.Header>Log In</Modal.Header>
                <Modal.Content>
                    <Form/>
                </Modal.Content>
            </Modal>
        )
    }
}

export default ModalExample
