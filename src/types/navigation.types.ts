export type RootStackParamList = {
  Groups: undefined;          
  GroupDetail: { groupId: string };
  Expenses: { groupId: string }; 
  AddExpense: { groupId: string };
  CreateGroup: undefined;

  SettleScreen: {
    groupId: string;
    payList: any[];
    receiveList: any[];
  };

  BalancesScreen: {
    groupId: string;
    balances: any;
  };

  SelectPeople: {
    selectedMembers?: string[];
    title?: string;
    mode?: 'single' | 'multiple';
  };
};