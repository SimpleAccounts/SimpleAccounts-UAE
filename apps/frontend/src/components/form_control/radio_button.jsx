import { HelpCircle } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Modern Radio Button Component
 * Uses shadcn/ui RadioGroup with tooltips
 */
function RadioButton(props) {
  const { selected, label, onChange, radio1, radio1Tooltip, radio2Tooltip, radio2 } = props;

  return (
    <TooltipProvider>
      <div className="mb-3">
        {label && (
          <Label className="mb-2 block">
            <span className="text-destructive">* </span>
            {label}
          </Label>
        )}
        <RadioGroup
          value={selected ? 'true' : 'false'}
          onValueChange={value => onChange(value === 'true')}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="radio1" />
            <Label htmlFor="radio1" className="font-normal cursor-pointer flex items-center gap-1">
              {radio1}
              {radio1Tooltip && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{radio1Tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="radio2" />
            <Label htmlFor="radio2" className="font-normal cursor-pointer flex items-center gap-1">
              {radio2}
              {radio2Tooltip && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{radio2Tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </Label>
          </div>
        </RadioGroup>
      </div>
    </TooltipProvider>
  );
}

export default RadioButton;
