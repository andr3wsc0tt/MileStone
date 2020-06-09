import React, { Component } from 'react'
import { Button, Header, Image, Modal } from 'semantic-ui-react'
import Form from './Form'


class ModalExample extends Component {

    constructor(props) {
        super(props);
        this.state = { modalOpen: true } // Automatically pop up
    }

    render() {
        return (
            // open = true so the modal pops up
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
