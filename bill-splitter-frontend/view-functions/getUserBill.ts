import { MODULE_ADDRESS } from "@/constants";
import { aptosClient } from "@/lib/utils/aptosClient";

export const getUserBillProposed = async (address: any): Promise<any> => {
  try {
    const content = await aptosClient().view<any>({
      payload: {
        function: `${MODULE_ADDRESS}::aptme::view_profile_bill_proposed`,
        functionArguments: [address],
      },
    });
    console.log("test", content);
    return content;
  } catch (error) {
    console.error("Error fetching bill proposed:", error);
    return [];
  }
};

export const getUserBillReceived = async (address: any): Promise<any> => {
  try {
    const content = await aptosClient().view<any>({
      payload: {
        function: `${MODULE_ADDRESS}::aptme::view_profile_bill_received`,
        functionArguments: [address],
      },
    });
    return content;
  } catch (error) {
    console.error("Error fetching bill received:", error);
    return [];
  }
};

export const getAllUserBill = async (): Promise<any> => {
  try {
    const content = await aptosClient().view({
      payload: {
        function: `${MODULE_ADDRESS}::global_state::view_all_bills`,
      },
    });
    console.log("test", content);
    return content;
  } catch (error) {
    console.error("Error fetching all bills:", error);
    return [];
  }
};
