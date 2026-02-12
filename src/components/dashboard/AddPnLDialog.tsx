import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useUpsertDailyPnL, useDailyPnL } from "@/hooks/usePnLData";
import { toast } from "sonner";

export const AddPnLDialog = () => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [pnl, setPnl] = useState("");
  const { data: dailyPnL } = useDailyPnL();
  const upsertPnL = useUpsertDailyPnL();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate && dailyPnL) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const existingEntry = dailyPnL.find(entry => entry.trade_date === dateStr);
      if (existingEntry) {
        setPnl(existingEntry.pnl.toString());
      } else {
        setPnl("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    const pnlValue = parseFloat(pnl);
    if (isNaN(pnlValue)) {
      toast.error("Please enter a valid P&L value");
      return;
    }

    try {
      await upsertPnL.mutateAsync({
        trade_date: format(date, "yyyy-MM-dd"),
        pnl: pnlValue,
      });
      toast.success("P&L entry saved successfully");
      setOpen(false);
      setPnl("");
      setDate(new Date());
    } catch (error: any) {
      if (error.message?.includes("duplicate")) {
        toast.error("An entry for this date already exists");
      } else {
        toast.error("Failed to add entry");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Add Daily P&L
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add/Edit Daily P&L Entry</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your profit or loss for a trading day. Existing entries for the same date will be updated.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-foreground">Trade Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-input border-border",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pnl" className="text-foreground">Daily P&L (₹)</Label>
            <Input
              id="pnl"
              type="number"
              step="0.01"
              placeholder="e.g., 1250 or -500"
              value={pnl}
              onChange={(e) => setPnl(e.target.value)}
              className="font-mono bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Enter positive for profit, negative for loss
            </p>
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={upsertPnL.isPending}
          >
            {upsertPnL.isPending ? "Saving..." : "Save Entry"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};