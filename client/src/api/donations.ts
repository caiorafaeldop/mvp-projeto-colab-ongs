import api from "./api";

// Donations API integrated with backend (Mercado Pago)
// Fixed organizationId for Rede Feminina (can be moved to env/config later)
const REDE_FEMININA_ORG_ID = "507f1f77bcf86cd799439012";
const REDE_FEMININA_ORG_NAME = "Rede Feminina de Combate ao Câncer";

export interface SingleDonationData {
  amount: number;
  donorName?: string;
  donorEmail: string;
  donorPhone?: string;
  donorDocument?: string;
  message?: string;
}

export interface RecurringDonationData {
  amount: number;
  frequency?: "monthly" | "weekly" | "yearly";
  donorName?: string;
  donorEmail: string;
  donorPhone?: string;
  donorDocument?: string;
  message?: string;
}

export const createSingleDonation = async (data: SingleDonationData) => {
  return api.post("/api/donations/single", {
    organizationId: REDE_FEMININA_ORG_ID,
    organizationName: REDE_FEMININA_ORG_NAME,
    donorName: data.donorName || "Anônimo",
    ...data,
  });
};

export const createRecurringDonation = async (data: RecurringDonationData) => {
  return api.post("/api/donations/recurring", {
    organizationId: REDE_FEMININA_ORG_ID,
    organizationName: REDE_FEMININA_ORG_NAME,
    donorName: data.donorName || "Anônimo",
    frequency: data.frequency || "monthly",
    ...data,
  });
};

export const cancelRecurringDonation = async (subscriptionId: string) => {
  return api.delete(`/api/donations/recurring/${subscriptionId}`);
};

export const getSubscriptionStatus = async (subscriptionId: string) => {
  return api.get(`/api/donations/recurring/${subscriptionId}/status`);
};

// Description: Get donation cause information
// Endpoint: GET /api/donations/cause
// Request: {}
// Response: { cause: { title: string, subtitle: string, description: string, mainImage: string, goal: number, raised: number, stats: { womenHelped: string, donors: string, yearsActive: string } } }
export const getDonationCause = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        cause: {
          title: "Apoie a Rede Feminina de Combate Ao Câncer",
          subtitle:
            "Apoiando mulheres em tratamento contra o câncer com amor, cuidado e esperança",
          description:
            "Nossa casa de apoio oferece um ambiente acolhedor e seguro para mulheres que enfrentam o câncer. Proporcionamos hospedagem, alimentação, apoio psicológico e acompanhamento durante todo o tratamento. Cada doação nos ajuda a manter este espaço de esperança e cura funcionando.",
          mainImage:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmOWE4ZDQiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmNDcyYjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q2FzYSBkZSBBcG9pbzwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjU1JSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPsOgcyBNdWxoZXJlczwvdGV4dD48L3N2Zz4=",
          goal: 25000,
          raised: 12500,
          stats: {
            womenHelped: "150+",
            donors: "89",
            yearsActive: "5",
          },
        },
      });
    }, 600);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/donations/cause');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Create donor subscription
// Endpoint: POST /api/donations/subscribe
// Request: { name: string, email: string, phone: string, document: string, amount: number, frequency: string, currency: string }
// Response: { success: boolean, subscriptionId: string, checkoutUrl: string, message: string }
export const createDonorSubscription = (_data: {
  name: string;
  email: string;
  phone: string;
  document: string;
  amount: number;
  frequency: string;
  currency: string;
}) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        subscriptionId: "sub_" + Date.now(),
        checkoutUrl: "https://checkout.stripe.com/mock-url",
        message: "Assinatura criada com sucesso!",
      });
    }, 1200);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/donations/subscribe', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Get donor dashboard data
// Endpoint: GET /api/donations/dashboard
// Request: {}
// Response: { dashboard: { donor: { name: string }, stats: { totalDonated: number, donationCount: number, monthsActive: number }, subscription: { status: string, amount: number, frequency: string, nextBilling: string }, donations: Array<{ amount: number, date: string, status: string }> } }
export const getDonorDashboard = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        dashboard: {
          donor: {
            name: "Maria Silva",
          },
          stats: {
            totalDonated: 450,
            donationCount: 9,
            monthsActive: 9,
          },
          subscription: {
            status: "active",
            amount: 50,
            frequency: "monthly",
            nextBilling: "2024-02-15T10:00:00Z",
          },
          donations: [
            { amount: 50, date: "2024-01-15T10:00:00Z", status: "completed" },
            { amount: 50, date: "2023-12-15T10:00:00Z", status: "completed" },
            { amount: 50, date: "2023-11-15T10:00:00Z", status: "completed" },
            { amount: 50, date: "2023-10-15T10:00:00Z", status: "completed" },
            { amount: 50, date: "2023-09-15T10:00:00Z", status: "completed" },
          ],
        },
      });
    }, 800);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/donations/dashboard');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Update subscription (pause/resume)
// Endpoint: PUT /api/donations/subscription
// Request: { action: string }
// Response: { success: boolean, message: string }
export const updateSubscription = (data: { action: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Assinatura ${data.action === "pause" ? "pausada" : "reativada"} com sucesso!`,
      });
    }, 800);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put('/api/donations/subscription', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Cancel subscription
// Endpoint: DELETE /api/donations/subscription
// Request: {}
// Response: { success: boolean, message: string }
export const cancelSubscription = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Assinatura cancelada com sucesso!",
      });
    }, 800);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.delete('/api/donations/subscription');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};
