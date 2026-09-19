'use client';
import React from 'react';
import { Container } from '../customComponents/Container';
import { Button } from '../ui/button';
import DevicesTable from './DevicesTable/DevicesTable';
import { WrapperContainer } from '../customComponents/WrapperContainer';
import { PlusIcon } from '@radix-ui/react-icons';

export const AllDevices = () => {
  console.log("is It Breaking here");
  return (
    <>
      <WrapperContainer>
        <Container>
          <div className=" flex flex-row justify-between pb-6 mb-6 border-b border-border">
            <div className=" flex flex-col gap-2">
              <div className="text-2xl font-semibold">All Devices</div>
              <div className="text-sm font-normal opacity-70">
                Please find a list of organisations below
              </div>
            </div>
            <Button className=' flex flex-row gap-2'> <PlusIcon/> New Device</Button>
          </div>
          <div>
            <DevicesTable />
          </div>
        </Container>
      </WrapperContainer>
    </>
  );
};
