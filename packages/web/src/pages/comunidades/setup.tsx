import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { getCommunityPack, type OrganizedCommunityType, type SetupStep } from '@/lib/communityPacks';
import { Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { useTranslations } from 'next-intl';

interface SetupFormData {
  // Step 1: Basic Info
  name: string;
  description: string;
  location: string;
  lat?: number;
  lng?: number;

  // Step 2: Invite Members
  memberEmails: string[];

  // Step 3: Configure Orders (for consumer groups)
  orderFrequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  pickupDay?: string;

  // Step 4: Pickup Point
  pickupLocation?: string;
  pickupInstructions?: string;
}

export default function CommunitySetupWizard() {
  const router = useRouter();
  const tSetup = useTranslations('communities');
  const tToasts = useTranslations('toasts');
  const { type } = router.query;
  const pack = type ? getCommunityPack(type as OrganizedCommunityType) : null;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<SetupFormData>({
    name: '',
    description: '',
    location: '',
    memberEmails: [''],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!type || !pack) {
      toast.error(tToasts('error.invalidCommunityType'));
      router.push('/');
    }
  }, [type, pack, router, tToasts]);

  if (!pack) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const currentStep = pack.setupSteps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / pack.setupSteps.length) * 100;

  const handleNext = () => {
    // Validate current step
    if (currentStepIndex === 0) {
      if (!formData.name || !formData.location) {
        toast.error(tToasts('error.completeRequiredFields'));
        return;
      }
    }

    if (currentStepIndex < pack.setupSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create community with onboarding pack
      const response = await api.post('/communities', {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        lat: formData.lat,
        lng: formData.lng,
        type: 'CUSTOM',
        visibility: 'PUBLIC',
        onboardingPack: {
          type: pack.type,
          setupData: formData,
        },
      });

      toast.success(tToasts('success.communityCreated'));

      // Redirect to community page
      const communitySlug = response.data.slug;
      router.push(`/communities/${communitySlug}?welcome=true`);
    } catch (error: any) {
      console.error('Error creating community:', error);
      toast.error(error.response?.data?.message || tToasts('error.creatingCommunity'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEmail = () => {
    setFormData({
      ...formData,
      memberEmails: [...formData.memberEmails, ''],
    });
  };

  const handleRemoveEmail = (index: number) => {
    const newEmails = formData.memberEmails.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      memberEmails: newEmails.length > 0 ? newEmails : [''],
    });
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...formData.memberEmails];
    newEmails[index] = value;
    setFormData({
      ...formData,
      memberEmails: newEmails,
    });
  };

  return (
    <>
      <Head>
        <title>Configurar {pack.name} - Truk</title>
      </Head>

      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">{pack.icon}</div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {tSetup('setup.configure')} {pack.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {tSetup('setup.step')} {currentStepIndex + 1} {tSetup('setup.of')} {pack.setupSteps.length}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Steps Timeline */}
            <div className="mb-8 flex justify-between">
              {pack.setupSteps.map((step, index) => (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      index < currentStepIndex
                        ? 'bg-green-600 text-white'
                        : index === currentStepIndex
                        ? 'bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-800'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="text-xs mt-2 text-center text-gray-600 dark:text-gray-400 hidden md:block">
                    {step.title}
                  </div>
                </div>
              ))}
            </div>

            {/* Current Step Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {currentStep.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {currentStep.description}
              </p>

              {/* Step-specific forms */}
              {currentStepIndex === 0 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {tSetup('setup.form.groupName')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={tSetup('setup.form.groupNamePlaceholder')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {tSetup('setup.form.description')}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={tSetup('setup.form.descriptionPlaceholder')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {tSetup('setup.form.location')} *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder={tSetup('setup.form.locationPlaceholder')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>
              )}

              {currentStepIndex === 1 && (
                <div className="space-y-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {tSetup('setup.invite.description')}
                  </p>

                  {formData.memberEmails.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => handleEmailChange(index, e.target.value)}
                        placeholder={tSetup('setup.invite.emailPlaceholder')}
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      />
                      {formData.memberEmails.length > 1 && (
                        <button
                          onClick={() => handleRemoveEmail(index)}
                          className="px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          {tSetup('setup.buttons.remove')}
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={handleAddEmail}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    {tSetup('setup.invite.addAnotherEmail')}
                  </button>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      {tSetup('setup.invite.skipHint')}
                    </p>
                  </div>
                </div>
              )}

              {currentStepIndex === 2 && pack.type === 'CONSUMER_GROUP' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {tSetup('setup.orders.frequency')}
                    </label>
                    <select
                      value={formData.orderFrequency || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          orderFrequency: e.target.value as any,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">{tSetup('setup.orders.select')}</option>
                      <option value="WEEKLY">{tSetup('setup.orders.weekly')}</option>
                      <option value="BIWEEKLY">{tSetup('setup.orders.biweekly')}</option>
                      <option value="MONTHLY">{tSetup('setup.orders.monthly')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {tSetup('setup.orders.pickupDay')}
                    </label>
                    <input
                      type="text"
                      value={formData.pickupDay || ''}
                      onChange={(e) => setFormData({ ...formData, pickupDay: e.target.value })}
                      placeholder={tSetup('setup.orders.pickupDayPlaceholder')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {currentStepIndex === 3 && pack.type === 'CONSUMER_GROUP' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {tSetup('setup.pickup.location')}
                    </label>
                    <input
                      type="text"
                      value={formData.pickupLocation || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, pickupLocation: e.target.value })
                      }
                      placeholder={tSetup('setup.pickup.locationPlaceholder')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {tSetup('setup.pickup.instructions')}
                    </label>
                    <textarea
                      value={formData.pickupInstructions || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, pickupInstructions: e.target.value })
                      }
                      placeholder={tSetup('setup.pickup.instructionsPlaceholder')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {currentStepIndex === pack.setupSteps.length - 1 && (
                <div className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
                    <h3 className="font-bold text-green-900 dark:text-green-100 mb-4 text-lg">
                      {tSetup('setup.complete.title')}
                    </h3>
                    <p className="text-green-800 dark:text-green-200 mb-4">
                      {tSetup('setup.complete.description')}
                    </p>
                    <ul className="space-y-2 text-green-700 dark:text-green-300">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <span>{tSetup('setup.complete.feature1')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <span>{tSetup('setup.complete.feature2')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <span>{tSetup('setup.complete.feature3')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <span>{tSetup('setup.complete.feature4')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                {tSetup('setup.buttons.previous')}
              </button>

              {currentStepIndex < pack.setupSteps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {tSetup('setup.buttons.next')}
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {tSetup('setup.buttons.creating')}
                    </>
                  ) : (
                    <>
                      {tSetup('setup.buttons.finish')}
                      <Check className="h-5 w-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

