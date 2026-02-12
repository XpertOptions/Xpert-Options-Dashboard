import { useState } from "react";
import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUpdateAccountSettings } from "@/hooks/usePnLData";
import { toast } from "sonner";

interface SettingsDialogProps {
  currentId: string;
  currentCapital: number;
}

export const SettingsDialog = ({ currentId, currentCapital }: SettingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [capital, setCapital] = useState(currentCapital.toString());
  const updateSettings = useUpdateAccountSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const capitalValue = parseFloat(capital);
    if (isNaN(capitalValue) || capitalValue <= 0) {
      toast.error("Please enter a valid capital amount");
      return;
    }

    try {
      await updateSettings.mutateAsync({
        id: currentId,
        initial_capital: capitalValue,
      });
      toast.success("Settings updated successfully");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="border-border bg-card hover:bg-muted">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Account Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure your initial trading capital.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="capital" className="text-foreground">Initial Capital (₹)</Label>
            <Input
              id="capital"
              type="number"
              step="1"
              placeholder="e.g., 100000"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              className="font-mono bg-input border-border text-foreground"
            />
            <p className="text-xs text-muted-foreground">
              All percentages will be calculated relative to this amount
            </p>
          </div>
          <Button
            type="submit"
            className="w-full gap-2 bg-primary hover:bg-primary/90"
            disabled={updateSettings.isPending}
          >
            <Save className="h-4 w-4" />
            {updateSettings.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};