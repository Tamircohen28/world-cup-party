import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Plus } from 'lucide-react';

export default function ItemsList({ items, currentUserId, currentUserName, onClaimItem, onReleaseItem, onAddItem }) {
  const [newItem, setNewItem] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎉');
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = () => {
    if (!newItem.trim()) return;
    onAddItem(newItem.trim(), newEmoji);
    setNewItem('');
    setNewEmoji('🎉');
    setShowAdd(false);
  };

  return (
    <div className="space-y-2">
      {(items || []).map((item) => {
        const isClaimed = !!item.claimed_by;
        const isClaimedByMe = item.claimed_by === currentUserId;
        
        return (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${
              isClaimed ? 'bg-primary/5 border border-primary/10' : 'bg-muted/50 border border-border'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{item.emoji}</span>
              <div>
                <span className={`text-sm font-medium ${isClaimed ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.name}
                </span>
                {isClaimed && (
                  <p className="text-xs text-primary">
                    {isClaimedByMe ? 'You' : item.claimed_by_name}
                    {' '}✓
                  </p>
                )}
              </div>
            </div>
            
            {isClaimedByMe ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReleaseItem(item.id)}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Release
              </Button>
            ) : !isClaimed ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onClaimItem(item.id)}
                className="text-xs text-primary hover:text-primary hover:bg-primary/10"
              >
                I'll Bring
              </Button>
            ) : null}
          </div>
        );
      })}
      
      {showAdd ? (
        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-xl">
          <Input
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value)}
            className="w-12 text-center text-lg bg-transparent border-none p-1"
            maxLength={2}
          />
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Item name..."
            className="flex-1 bg-transparent border-none"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button size="sm" onClick={handleAdd} className="bg-primary hover:bg-primary/90">
            <Check className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 w-full p-3 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Add item...
        </button>
      )}
    </div>
  );
}