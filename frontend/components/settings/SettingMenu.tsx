import React from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import OrgSettings from './OrgSettings';
import { OrgManageUsers } from './ManageUsers/OrgManageUsers';
import  OrgManageDevice  from './MangeDevice/OrgManageDevice';
import { RolesProvider } from './ManageUsers/UserTable/Roles';


export default function SettingMenu() {
  return (
    <Tabs defaultValue="organisation-profile">
          <TabsList className="flex justify-start mb-4 w-fit">
            {/* {Satish Please Make Sure UI} */}
            <TabsTrigger className='px-5' value="organisation-profile">Organisation Profile</TabsTrigger>
            <TabsTrigger className='px-5' value="manage-users">Manage Users</TabsTrigger>
            <TabsTrigger className='px-5' value="manage-devices">Manage Devices</TabsTrigger>
          </TabsList>
          <TabsContent className=' w-[100%] p-0 ' value="organisation-profile">
            <OrgSettings />
          </TabsContent>
          <TabsContent className='' value="manage-users">
            <RolesProvider>
            <OrgManageUsers />
            </RolesProvider>
          </TabsContent>
          <TabsContent value="manage-devices">
            <OrgManageDevice/>
          </TabsContent>
    </Tabs>
  );
};
