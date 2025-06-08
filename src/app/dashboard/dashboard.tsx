import { useEffect, useState } from 'react';
import { Search, Grid, List, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import FloCard, { FLO_CARD } from '@/components/flowCard';
import flowService from '@/services/flow';
import moment from 'moment';
import { timeDiffFromNow } from '@/lib/utils';
import AddFlowModal from './addFlowModal';
import settings from '@/config/app';
import Image from 'next/image';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('Last Viewed');
  const [flows, setFlows] = useState<Array<FLO_CARD>>([]);
  const [page, setPage] = useState(1);
  let currentPage = 0;

  const getFlows = async (page: number) => {
    const res = await flowService.getFlows(page, true);
    return res;
  }

  const handleOnFlowDeleted = (id: string) => {
    setFlows(flows.filter((f) => f.id !== id));
  }

  useEffect(() => {
    if (page < currentPage) return;
    getFlows(page).then((res) => {
      const flowList: Array<FLO_CARD> = res.map((f: Record<string, any>) => ({
        id: f.id,
        createdAt: timeDiffFromNow(moment(f.createdAt).local().toDate()),
        name: f.name,
        status: f.status,
        user: {
          id: f.user.id,
          imageURL: f.user.imageURL,
          name: f.user.name
        },
        description: f.description
      }));
      if (page <= currentPage) return;
      currentPage = page;
      setFlows((prev) => [
        ...prev,
        ...flowList
      ]);
    });
  }, [page]);

  const addNewFlow = () => {
    
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-fit border-r border-border flex flex-col justify-between">
        <div className="p-4  flex items-center">
          <div className="rounded-md mr-2">
            <Image 
              alt='aiflo'
              src={'aiflo-dark.svg'}
              height={32}
              width={32}
            />
          </div>
          <h1>{settings.brandName}</h1>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <div className="rounded-full w-8 h-8 flex items-center justify-center">
              M
            </div>
            <div>
              <p className="text-sm font-medium">User</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h1>My Flows</h1>
          <AddFlowModal 
            handleFlowAdded = {
              (data: FLO_CARD) => setFlows((prev) => [data, ...prev])
            }
          />
        </header>

        {/* Search and Options */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search"
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {sortBy}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('Last Viewed')}>
                  Last Viewed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('Name')}>
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('Date Created')}>
                  Date Created
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  All
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>All</DropdownMenuItem>
                <DropdownMenuItem>Forms</DropdownMenuItem>
                <DropdownMenuItem>Workflows</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? "default" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-none"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? "default" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-none"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-5 ">
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {flows.map((flow) => (
              <FloCard onFlowDeleted={handleOnFlowDeleted} viewMode={viewMode} flow={flow} key={flow.id} />
            ))}
          </div>
        </div>
      </div>

      {/* Add Flow Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Flow</DialogTitle>
            <DialogDescription>
              Create a new workflow to automate your business processes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Flow name"
              value={newFlowName}
              onChange={(e) => setNewFlowName(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}