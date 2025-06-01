"use client"
// pages/login.tsx
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form'; // Import useForm and SubmitHandler
import { zodResolver } from '@hookform/resolvers/zod'; // Optional: For Zod schema validation
import * as z from 'zod'; // Optional: For Zod schema validation

import { FcGoogle } from 'react-icons/fc'; // Google icon from react-icons
import { useRouter } from 'next/navigation';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'; // Ensure FormItem and FormLabel are imported if your UI lib uses them
import { Label } from '@/components/ui/label'; // You might not need this if using FormLabel
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import GoogleLoginButton from '@/components/googleLoginButton';
import { Card } from '@/components/ui/card';

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormInputs = z.infer<typeof formSchema>;

const Login = () => {
  const router = useRouter();

  const form = useForm<LoginFormInputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
    router.push('/dashboard');
  };

  const handleGoogleLogin = () => {
    console.log('Google login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className='p-5 w-1/4'>
        <h1 className="text-center mb-6">Welcome to AIFlo</h1>
        {/* Spread the form methods onto the Form component */}
        {/* And use form.handleSubmit for submission */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control} // Pass control from useForm
              name="email"
              render={({ field }) => (
                <FormItem> {/* Use FormItem for better structure with shadcn/ui */}
                  <FormLabel>Email</FormLabel> {/* Use FormLabel */}
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field} // Spread field props (onChange, onBlur, value, ref)
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control} // Pass control from useForm
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field} // Spread field props
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mt-4">
              Continue
            </Button>
          </form>
        </Form>

        <div className="my-2 flex items-center">
          <Separator className=' flex-1'/> {/* Use flex-grow for separator */}
          <span className="px-2 text-sm text-muted-foreground">OR</span>
          <Separator className='flex-1'/>
        </div>

        <GoogleLoginButton />
        </Card>
    </div>
  );
};

export default Login;