import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon } from '@radix-ui/react-icons';
interface HeaderProps {
  onNewOrganisationClick: () => void;
}
export const Header = ({ onNewOrganisationClick }: HeaderProps) => {
  return (
    <div className="flex border-0 flex-row justify-between items-center py-6">
      <h1 className="text-3xl tracking-wide">Organisations</h1>
      <Button className=' flex flex-row gap-2 justify-center items-center' onClick={onNewOrganisationClick}>  <PlusIcon/> New Organisation</Button>
    </div>
  );
};
