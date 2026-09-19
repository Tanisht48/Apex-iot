import React from 'react';

import { WrapperContainer } from '@/components/customComponents/WrapperContainer';
import SettingMenu from '@/components/settings/SettingMenu';

export default function OrgSettingsPage() {
  return (
    <>
      <WrapperContainer className='flex flex-col gap-8 bg-background'>
        <div className='border-border border-b  pb-8'>
          <div className="text-2xl font-semibold ">Settings</div>
          <div className="text-sm font-normal opacity-70">
            Manage your Organisation settings.
          </div>
        </div>
        <SettingMenu />
      </WrapperContainer>
    </>
  );
}
