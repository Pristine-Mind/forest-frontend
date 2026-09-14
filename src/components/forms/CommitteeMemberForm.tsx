'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MemberSearchField } from '@/components/committee/member-search-field';
import { committeeMemberSchema, type CommitteeMemberInput } from '@/schemas/committee-member.schema';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import type { MemberSearchResult } from '@/types/committee';

const POSITIONS = [
  { value: 'chair', label: 'Chair' },
  { value: 'vice_chair', label: 'Vice Chair' },
  { value: 'secretary', label: 'Secretary' },
  { value: 'joint_secretary', label: 'Joint Secretary' },
  { value: 'treasurer', label: 'Treasurer' },
  { value: 'member', label: 'Member' },
] as const;

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const;

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'vacant', label: 'Vacant' },
  { value: 'removed', label: 'Removed' },
] as const;

interface CommitteeMemberFormProps {
  /** Initial form values (for edit mode) */
  initialValues?: Partial<CommitteeMemberInput>;
  /** Callback on successful submission */
  onSubmit: (data: CommitteeMemberInput) => Promise<void>;
  /** Whether to show loading state */
  isLoading?: boolean;
  /** Available sub-committees */
  subcommittees?: Array<{ id: number; name: string }>;
}

export function CommitteeMemberForm({
  initialValues,
  onSubmit,
  isLoading = false,
  subcommittees = [],
}: CommitteeMemberFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CommitteeMemberInput>({
    resolver: zodResolver(committeeMemberSchema),
    defaultValues: {
      member: initialValues?.member ?? null,
      position: initialValues?.position ?? 'member',
      gender: initialValues?.gender ?? '',
      caste_ethnicity: initialValues?.caste_ethnicity ?? '',
      term_start: initialValues?.term_start ?? '',
      term_end: initialValues?.term_end ?? '',
      status: initialValues?.status ?? 'active',
      subcommittees: initialValues?.subcommittees ?? [],
    },
  });

  const handleSubmit = async (data: CommitteeMemberInput) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setSubmitError(message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {submitError && (
          <div className="flex items-start gap-3 p-4 border border-red-200 bg-red-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Member Selection</CardTitle>
            <CardDescription>
              Search and select either a household head or a household member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="member"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Household or Member</FormLabel>
                  <FormControl>
                    <MemberSearchField
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Type at least 2 characters to search by name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Committee Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Position */}
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {POSITIONS.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gender */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GENDERS.map((gender) => (
                        <SelectItem key={gender.value} value={gender.value}>
                          {gender.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Caste/Ethnicity */}
            <FormField
              control={form.control}
              name="caste_ethnicity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caste/Ethnicity (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter caste or ethnicity"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Term Dates</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {/* Term Start */}
            <FormField
              control={form.control}
              name="term_start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Term End */}
            <FormField
              control={form.control}
              name="term_end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term End Date</FormLabel>
                  <FormControl>
                    <Input type="date" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Sub-committees */}
        {subcommittees.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sub-committees (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="subcommittees"
                render={() => (
                  <FormItem>
                    <div className="space-y-3">
                      {subcommittees.map((sc) => (
                        <FormField
                          key={sc.id}
                          control={form.control}
                          name="subcommittees"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(sc.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, sc.id])
                                      : field.onChange(
                                          field.value?.filter((id) => id !== sc.id)
                                        );
                                  }}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {sc.name}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : 'Save Committee Member'}
        </Button>
      </form>
    </Form>
  );
}
