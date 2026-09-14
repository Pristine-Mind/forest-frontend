'use client';
import { useCallback, useState } from 'react';
import { useMemberSearch } from '@/hooks/use-member-search';
import type { MemberSearchResult } from '@/types/committee';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberSearchFieldProps {
  /** Selected member */
  value?: MemberSearchResult | null;
  /** Callback when member is selected */
  onChange: (member: MemberSearchResult | null) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Filter by member type */
  memberType?: 'all' | 'household' | 'member';
  /** Disable the field */
  disabled?: boolean;
  /** Custom CSS class */
  className?: string;
}

export function MemberSearchField({
  value,
  onChange,
  placeholder = 'Search household or member...',
  memberType = 'all',
  disabled = false,
  className,
}: MemberSearchFieldProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: results = [], isLoading, error } = useMemberSearch(searchQuery, memberType);

  const handleSelect = useCallback(
    (member: MemberSearchResult) => {
      onChange(member);
      setOpen(false);
      setSearchQuery('');
    },
    [onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
      setSearchQuery('');
    },
    [onChange]
  );

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    // Open the popover when user starts typing
    if (query.length >= 2 && !open) {
      setOpen(true);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between', className)}
        >
          <div className="flex items-center gap-2 flex-1">
            {value ? (
              <>
                <span className="truncate">{value.name}</span>
                <Badge variant="secondary" className="flex-shrink-0">
                  {value.type === 'household' ? '👥' : '👤'} {value.type}
                </Badge>
                {!disabled && (
                  <button
                    onClick={handleClear}
                    className="ml-auto text-gray-500 hover:text-gray-700"
                    title="Clear selection"
                  >
                    ×
                  </button>
                )}
              </>
            ) : (
              <>
                <Search className="h-4 w-4 text-gray-500" />
                <span className="text-gray-500">{placeholder}</span>
              </>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={searchQuery}
            onValueChange={handleSearchChange}
            disabled={disabled}
            className="border-0"
          />

          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              <span className="ml-2 text-sm text-gray-500">Searching...</span>
            </div>
          )}

          {error && (
            <div className="p-2 text-sm text-red-500">
              Error loading results. Please try again.
            </div>
          )}

          {!isLoading && results.length === 0 && searchQuery.length >= 2 && (
            <CommandEmpty>No members found matching "{searchQuery}"</CommandEmpty>
          )}

          {!isLoading && searchQuery.length < 2 && (
            <div className="p-2 text-sm text-gray-500">
              Type at least 2 characters to search
            </div>
          )}

          <CommandList className="max-h-[300px]">
            {results.length > 0 && (
              <>
                {/* Household Group */}
                {results.some((r) => r.type === 'household') && (
                  <CommandGroup heading="👥 Households">
                    {results
                      .filter((r) => r.type === 'household')
                      .map((result) => (
                        <CommandItem
                          key={`household-${result.id}`}
                          value={result.id.toString()}
                          onSelect={() => handleSelect(result)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              value?.id === result.id && value.type === 'household'
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{result.name}</p>
                            {result.tole && (
                              <p className="text-xs text-gray-500">{result.tole}</p>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}

                {/* Member Group */}
                {results.some((r) => r.type === 'member') && (
                  <CommandGroup heading="👤 Household Members">
                    {results
                      .filter((r) => r.type === 'member')
                      .map((result) => (
                        <CommandItem
                          key={`member-${result.id}`}
                          value={result.id.toString()}
                          onSelect={() => handleSelect(result)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              value?.id === result.id && value.type === 'member'
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{result.name}</p>
                            {result.household_name && (
                              <p className="text-xs text-gray-500">
                                from {result.household_name}
                              </p>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
