export const sendSuccessResponse = (message: string, data: any = {}) => {
  return {
    success: true,
    message,
    data,
  };
};

export const sendErrorResponse = (message: string, errors: any[] = []) => {
  return {
    success: false,
    message,
    errors,
  };
};
