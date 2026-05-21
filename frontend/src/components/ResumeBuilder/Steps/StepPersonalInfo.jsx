import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalInfoSchema } from '../../../lib/formValidation';
import { useResume } from '../../../context/ResumeContext';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Camera } from 'lucide-react';

export function StepPersonalInfo({ onNext, onBack }) {
  const { resumeData, updatePersonalInfo } = useResume();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: resumeData.personalInfo,
  });

  const photo = watch('photo');

  useEffect(() => {
    // Sync form with resume data when it changes
    Object.keys(resumeData.personalInfo).forEach(key => {
      setValue(key, resumeData.personalInfo[key]);
    });
  }, [resumeData.personalInfo, setValue]);

  const onSubmit = (data) => {
    updatePersonalInfo(data);
    onNext();
  };

  const toTitleCase = (str) => {
    return str.replace(/\b\w/g, c => c.toUpperCase());
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('photo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-navy-950 dark:text-white">Personal Information</h2>
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Step 01</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <Input
            label="Full Name *"
            id="name"
            placeholder="John Doe"
            {...register('name', {
              onChange: (e) => {
                setValue('name', toTitleCase(e.target.value), { shouldValidate: true });
              }
            })}
            error={errors.name?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Phone Number"
              id="phone"
              placeholder="+91 98765 43210"
              {...register('phone')}
              error={errors.phone?.message}
            />
          </div>

          <Input
            label="Location (City, Country)"
            id="location"
            placeholder="New Delhi, India"
            {...register('location')}
            error={errors.location?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="LinkedIn Profile"
              id="linkedin"
              placeholder="https://linkedin.com/in/johndoe"
              {...register('linkedin')}
              error={errors.linkedin?.message}
            />

            <Input
              label="Portfolio / Website"
              id="portfolio"
              placeholder="https://johndoe.com"
              {...register('portfolio')}
              error={errors.portfolio?.message}
            />
          </div>
        </div>

        <div className="md:w-48 flex flex-col items-center">
          <label className="label self-start mb-2">Profile Photo</label>
          <div className="relative group w-full aspect-square bg-gray-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 flex items-center justify-center overflow-hidden transition-all hover:border-maroon-500/50">
            {photo ? (
              <img
                src={photo}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-maroon-500 transition-colors">
                <Camera className="w-8 h-8" />
                <span className="text-[10px] uppercase font-bold tracking-tighter">Upload Image</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {photo && (
              <div className="absolute inset-0 bg-navy-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold px-3 py-1 bg-maroon-600 rounded-full">Change</span>
              </div>
            )}
          </div>
          <p className="text-[10px] text-gray-500 mt-3 text-center italic">Supported: JPG, PNG (Max 2MB)</p>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-slate-800">
        <Button type="submit" size="lg" className="w-full md:w-auto px-12">
          Next Step
        </Button>
      </div>
    </form>
  );
}
