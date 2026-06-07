import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, HelpCircle, X } from 'lucide-react';

const options = [
  { status: 'attending', label: 'Going', icon: Check, activeClass: 'bg-primary text-primary-foreground hover:bg-primary/90', inactiveClass: 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20' },
  { status: 'maybe', label: 'Maybe', icon: HelpCircle, activeClass: 'bg-secondary text-secondary-foreground hover:bg-secondary/90', inactiveClass: 'bg-secondary/10 text-secondary hover:bg-secondary/20 border border-secondary/20' },
  { status: 'not-attending', label: 'Skip', icon: X, activeClass: 'bg-muted text-muted-foreground', inactiveClass: 'bg-muted/50 text-muted-foreground hover:bg-muted border border-border' },
];

export default function RsvpButtons({ currentStatus, onRsvp, disabled }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map(({ status, label, icon: Icon, activeClass, inactiveClass }) => (
        <Button
          key={status}
          variant="ghost"
          size="lg"
          disabled={disabled}
          onClick={() => onRsvp(status)}
          className={`h-12 rounded-xl font-semibold transition-all ${
            currentStatus === status ? activeClass : inactiveClass
          }`}
        >
          <Icon className="w-4 h-4 mr-1.5" />
          {label}
        </Button>
      ))}
    </div>
  );
}