import { useState } from 'react';
import { EscrowFilters as EscrowFiltersType, EscrowStatus } from '@/lib/api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Filter,
  X,
  Calendar as CalendarIcon,
  Search,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';

interface EscrowFiltersProps {
  filters: EscrowFiltersType;
  onFiltersChange: (filters: EscrowFiltersType) => void;
  onReset: () => void;
  activeCount?: number;
}

const statusOptions = [
  { value: EscrowStatus.CREATED, label: 'Created' },
  { value: EscrowStatus.FUNDED, label: 'Funded' },
  { value: EscrowStatus.PENDING, label: 'Pending' },
  { value: EscrowStatus.RELEASED, label: 'Released' },
  { value: EscrowStatus.REFUNDED, label: 'Refunded' },
  { value: EscrowStatus.DISPUTED, label: 'Disputed' },
  { value: EscrowStatus.CANCELLED, label: 'Cancelled' },
  { value: EscrowStatus.EXPIRED, label: 'Expired' },
];

const amountRanges = [
  { value: '0-1000', label: '₦0 - ₦1,000' },
  { value: '1000-5000', label: '₦1,000 - ₦5,000' },
  { value: '5000-10000', label: '₦5,000 - ₦10,000' },
  { value: '10000-50000', label: '₦10,000 - ₦50,000' },
  { value: '50000-100000', label: '₦50,000 - ₦100,000' },
  { value: '100000+', label: '₦100,000+' },
];

export function EscrowFilters({ 
  filters, 
  onFiltersChange, 
  onReset, 
  activeCount = 0 
}: EscrowFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  );

  const updateFilter = (key: keyof EscrowFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleStatusChange = (status: EscrowStatus) => {
    updateFilter('status', filters.status === status ? undefined : status);
  };

  const handleDateRangeUpdate = () => {
    updateFilter('startDate', startDate?.toISOString());
    updateFilter('endDate', endDate?.toISOString());
  };

  const parseAmountRange = (range: string) => {
    if (range === '100000+') {
      return { min: 100000, max: undefined };
    }
    const [min, max] = range.split('-').map(Number);
    return { min, max };
  };

  const handleAmountRangeChange = (range: string) => {
    const { min, max } = parseAmountRange(range);
    updateFilter('minAmount', min);
    updateFilter('maxAmount', max);
  };

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by reference, customer, or vendor..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value || undefined)}
              className="pl-10"
            />
          </div>
        </div>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-80" align="end">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Filter Escrows</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                      <Badge
                        key={option.value}
                        variant={
                          filters.status === option.value ? 'default' : 'outline'
                        }
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleStatusChange(option.value)}
                      >
                        {option.label}
                        {filters.status === option.value && (
                          <X className="ml-1 h-3 w-3" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Amount Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Amount Range</Label>
                  <Select onValueChange={handleAmountRangeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      {amountRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Amount Range */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Min Amount</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minAmount || ''}
                      onChange={(e) => updateFilter('minAmount', Number(e.target.value) || undefined)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Max Amount</Label>
                    <Input
                      type="number"
                      placeholder="No limit"
                      value={filters.maxAmount || ''}
                      onChange={(e) => updateFilter('maxAmount', Number(e.target.value) || undefined)}
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, 'MMM dd') : 'Start'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                        <div className="p-2">
                          <Button size="sm" onClick={handleDateRangeUpdate}>
                            Apply
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, 'MMM dd') : 'End'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                        <div className="p-2">
                          <Button size="sm" onClick={handleDateRangeUpdate}>
                            Apply
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Customer/Vendor */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Customer ID</Label>
                      <Input
                        placeholder="Customer"
                        value={filters.customerId || ''}
                        onChange={(e) => updateFilter('customerId', e.target.value || undefined)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Vendor ID</Label>
                      <Input
                        placeholder="Vendor"
                        value={filters.vendorId || ''}
                        onChange={(e) => updateFilter('vendorId', e.target.value || undefined)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <Badge
              key={filters.status}
              variant="secondary"
              className="flex items-center space-x-1"
            >
              <span>{filters.status}</span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleStatusChange(filters.status!)}
              />
            </Badge>
          )}
          
          {(filters.minAmount || filters.maxAmount) && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>
                ₦{filters.minAmount || 0} - ₦{filters.maxAmount || '∞'}
              </span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  updateFilter('minAmount', undefined);
                  updateFilter('maxAmount', undefined);
                }}
              />
            </Badge>
          )}
          
          {filters.search && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>"{filters.search}"</span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('search', undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}