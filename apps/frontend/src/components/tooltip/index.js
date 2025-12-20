import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

class ToolTip extends React.Component {
  render() {
    const { id, content, placement } = this.props;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div id={id} style={{ display: 'inline-block' }}>
              {this.props.children}
            </div>
          </TooltipTrigger>
          <TooltipContent side={placement || 'top'}>
            <p>{content}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
}

export default ToolTip;
