// API Query Hooks
export { useApiQuery, useApiMutation, useInvalidateQueries } from './use-api-query';

// Auth mutations
export {
  useSignupMutation,
  useSigninMutation,
  useForgotPasswordMutation,
  useVerifyResetCodeMutation,
  useResetPasswordMutation,
  useResendVerificationMutation,
} from './use-auth-mutations';

// Quiz hooks
export {
  useQuizzes,
  useQuizCategories,
  useQuiz,
  useQuizHistory,
  useSubmitQuizMutation,
} from './use-quiz';

// Product hooks
export {
  useProducts,
  useProductCategories,
  useProduct,
} from './use-products';

// Cart hooks
export {
  useCart,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} from './use-cart';

// Study hooks
export {
  useUserQuizzes,
  useUserQuiz,
  useSaveQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
} from './use-study';

// Payment hooks
export {
  usePaymentHistory,
  usePayment,
} from './use-payment';

// Profile hooks
export {
  useProfile,
  useUser,
  useUpdateProfileMutation,
} from './use-profile';

// Card hooks
export {
  useCards,
  useSaveCardMutation,
  useSetDefaultCardMutation,
  useDeleteCardMutation,
} from './use-cards';
