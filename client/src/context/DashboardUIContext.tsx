import { createContext, useContext, useState, ReactNode } from "react";
import { Card, Dashboard } from "@shared/schema";

interface DashboardUIContextProps {
  // Edit mode state
  isEditMode: boolean;
  toggleEditMode: () => void;
  
  // Card modal state
  cardModals: {
    add: {
      isOpen: boolean;
      onOpen: () => void;
      onClose: () => void;
    };
    edit: {
      isOpen: boolean;
      card?: Card;
      onOpen: (card: Card) => void;
      onClose: () => void;
    };
    delete: {
      isOpen: boolean;
      itemId?: number;
      itemName: string;
      onOpen: (id: number, name: string) => void;
      onClose: () => void;
      onConfirm: (id: number) => void;
    };
  };
  
  // Dashboard modal state
  dashboardModals: {
    create: {
      isOpen: boolean;
      onOpen: () => void;
      onClose: () => void;
    };
    edit: {
      isOpen: boolean;
      dashboard?: Dashboard;
      onOpen: (dashboard: Dashboard) => void;
      onClose: () => void;
    };
    delete: {
      isOpen: boolean;
      itemId?: number;
      itemName: string;
      onOpen: (id: number, name: string) => void;
      onClose: () => void;
    };
  };
}

const DashboardUIContext = createContext<DashboardUIContextProps | undefined>(undefined);

export function DashboardUIProvider({ children }: { children: ReactNode }) {
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Card add modal state
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  
  // Card edit modal state
  const [isEditCardModalOpen, setIsEditCardModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Card | undefined>(undefined);
  
  // Card delete modal state
  const [isDeleteCardModalOpen, setIsDeleteCardModalOpen] = useState(false);
  const [cardToDeleteId, setCardToDeleteId] = useState<number | undefined>(undefined);
  const [cardToDeleteName, setCardToDeleteName] = useState("");
  
  // Dashboard create modal state
  const [isCreateDashboardModalOpen, setIsCreateDashboardModalOpen] = useState(false);
  
  // Dashboard edit modal state
  const [isEditDashboardModalOpen, setIsEditDashboardModalOpen] = useState(false);
  const [dashboardToEdit, setDashboardToEdit] = useState<Dashboard | undefined>(undefined);
  
  // Dashboard delete modal state
  const [isDeleteDashboardModalOpen, setIsDeleteDashboardModalOpen] = useState(false);
  const [dashboardToDeleteId, setDashboardToDeleteId] = useState<number | undefined>(undefined);
  const [dashboardToDeleteName, setDashboardToDeleteName] = useState("");
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
  };
  
  // Card modal handlers
  const openAddCardModal = () => setIsAddCardModalOpen(true);
  const closeAddCardModal = () => setIsAddCardModalOpen(false);
  
  const openEditCardModal = (card: Card) => {
    setCardToEdit(card);
    setIsEditCardModalOpen(true);
  };
  
  const closeEditCardModal = () => {
    setIsEditCardModalOpen(false);
    setCardToEdit(undefined);
  };
  
  const openDeleteCardModal = (id: number, name: string) => {
    setCardToDeleteId(id);
    setCardToDeleteName(name);
    setIsDeleteCardModalOpen(true);
  };
  
  const closeDeleteCardModal = () => {
    setIsDeleteCardModalOpen(false);
    setCardToDeleteId(undefined);
    setCardToDeleteName("");
  };
  
  // Dashboard modal handlers
  const openCreateDashboardModal = () => setIsCreateDashboardModalOpen(true);
  const closeCreateDashboardModal = () => setIsCreateDashboardModalOpen(false);
  
  const openEditDashboardModal = (dashboard: Dashboard) => {
    setDashboardToEdit(dashboard);
    setIsEditDashboardModalOpen(true);
  };
  
  const closeEditDashboardModal = () => {
    setIsEditDashboardModalOpen(false);
    setDashboardToEdit(undefined);
  };
  
  const openDeleteDashboardModal = (id: number, name: string) => {
    setDashboardToDeleteId(id);
    setDashboardToDeleteName(name);
    setIsDeleteDashboardModalOpen(true);
  };
  
  const closeDeleteDashboardModal = () => {
    setIsDeleteDashboardModalOpen(false);
    setDashboardToDeleteId(undefined);
    setDashboardToDeleteName("");
  };
  
  const contextValue: DashboardUIContextProps = {
    isEditMode,
    toggleEditMode,
    
    cardModals: {
      add: {
        isOpen: isAddCardModalOpen,
        onOpen: openAddCardModal,
        onClose: closeAddCardModal,
      },
      edit: {
        isOpen: isEditCardModalOpen,
        card: cardToEdit,
        onOpen: openEditCardModal,
        onClose: closeEditCardModal,
      },
      delete: {
        isOpen: isDeleteCardModalOpen,
        itemId: cardToDeleteId,
        itemName: cardToDeleteName,
        onOpen: openDeleteCardModal,
        onClose: closeDeleteCardModal,
        onConfirm: (id) => {
          // This will be implemented by the component that uses this context
          // Close modal handled by DeleteConfirmModal
        },
      },
    },
    
    dashboardModals: {
      create: {
        isOpen: isCreateDashboardModalOpen,
        onOpen: openCreateDashboardModal,
        onClose: closeCreateDashboardModal,
      },
      edit: {
        isOpen: isEditDashboardModalOpen,
        dashboard: dashboardToEdit,
        onOpen: openEditDashboardModal,
        onClose: closeEditDashboardModal,
      },
      delete: {
        isOpen: isDeleteDashboardModalOpen,
        itemId: dashboardToDeleteId,
        itemName: dashboardToDeleteName,
        onOpen: openDeleteDashboardModal,
        onClose: closeDeleteDashboardModal,
      },
    },
  };
  
  return (
    <DashboardUIContext.Provider value={contextValue}>
      {children}
    </DashboardUIContext.Provider>
  );
}

export function useDashboardUI() {
  const context = useContext(DashboardUIContext);
  
  if (!context) {
    throw new Error("useDashboardUI must be used within a DashboardUIProvider");
  }
  
  return context;
}
