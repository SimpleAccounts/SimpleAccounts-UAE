import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import './style.scss'
import { authApi } from 'utils';
import { toast } from 'sonner';

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
        <p className="template-title flex items-center gap-2">
          <Checkbox checked={enable} 
          onCheckedChange={() => updateMailTheme(templateId, templateTitle)()}
        />
        <b>{templateTitle}</b></p>
        <img className="template-gallery" src={templateImg} onClick={this.openDialog}></img>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" className="dialog show_preview" id="caption_2_link" onClick={this.openDialog}>Preview</Button>
          <Button variant="default" size="sm" className="use_theme" onClick={
            updateMailTheme(templateId, templateTitle)
          }>Use Theme</Button>
        </div>

        <Dialog open={this.state.isOpen} onOpenChange={this.closePreviewModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <div className="flex justify-between items-center w-full">
                <DialogTitle><b>{templateTitle}</b></DialogTitle>
                {/* Close button handled by Dialog primitive */}
              </div>
            </DialogHeader>
            <div className="flex justify-center">
              <img className="preview-gallery w-full h-auto" src={templateImg} alt={templateTitle}></img>
            </div>
          </DialogContent>
        </Dialog>
      </div>


    )
  }
}

export default TemplateComponent


