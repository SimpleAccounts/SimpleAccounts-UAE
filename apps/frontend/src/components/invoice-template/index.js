import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import './style.scss'
import { authApi } from 'utils';
import { toast } from 'react-toastify';
import { Checkbox } from '@material-ui/core';

function updateMailTheme(id, templateTitle) {


  return (dispatch) => {
    let data = {
      method: 'Post',
      url: `/rest/templates/updateMailTemplateTheme?templateId=${id}`,
    };
    toast.success(templateTitle + " Selected Successfully...!")
    window.location.reload(false);
    return authApi(data)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        throw err;
      });
  };

};

class TemplateComponent extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      templateTitle: props.templateTitle,
      isOpen: false,
      enable: ''
    }

  }

  openDialog = () => {
    this.setState({ isOpen: true });
  };
  closePreviewModal = () => {
    this.setState({ isOpen: false });
  };

  loadChange = (templateId, checkdata) => {

    // if(checkdata){
    //   let t=parseInt(templateId);
    // for(let i=0;i<checkdata.length;i++)
    // {
    //   if(checkdata[i].templateId===t){

    //     let v=checkdata[i].enable;
    //     this.setState({enable:v});
    //    }else{
    //     this.setState({enable:false});
    //    }
    // }


    // }


  }

  render() {

    const {
      templateTitle,
      templateImg,
      templateId,
      checkdata,
      enable,
      styles
    } = this.props


    return (
      <div className="theme-wrapper">
        <p className="template-title">
          <Checkbox checked={enable} 
          onClick={
          updateMailTheme(templateId, templateTitle)
        }>

        </Checkbox>
        <b>{templateTitle}</b></p>
        <img className="template-gallery" src={templateImg} onClick={this.openDialog}></img>
        <p>
          <a className="dialog show_preview Button" id="caption_2_link" onClick={this.openDialog}>Preview</a>
          <p className="use_theme Button" onClick={

            updateMailTheme(templateId, templateTitle)

          }>Use Theme</p>
        </p>

        <Modal isOpen={this.state.isOpen} centered className="modal-primary">
          <ModalHeader tag="h4" className="preview-modal-title" toggle={this.toggleDanger} >
            <h5 className="mb-0"><b>{templateTitle}</b></h5>
            <i className="fa fa-close close-btn"
              onClick={() => this.closePreviewModal()}
            ></i>
          </ModalHeader>
          <ModalBody>
            <img className="preview-gallery" src={templateImg}></img>

          </ModalBody>
        </Modal>
      </div>


    )
  }
}

export default TemplateComponent


