export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export const successResponse = <T>(
  data: T,
  message = 'Operation successful',
): SuccessResponse<T> => ({
  success: true,
  message,
  data,
});

export const errorResponse = (
  message: string,
  errors?: Array<{ field: string; message: string }>,
): ErrorResponse => {
  const response: ErrorResponse = {
    success: false,
    message,
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  return response;
};

/** Controllers historically used (message, data) argument order */
export const sendSuccessResponse = <T>(message: string, data: T = {} as T): SuccessResponse<T> =>
  successResponse(data, message);

export const sendErrorResponse = (
  message: string,
  errors: Array<{ field: string; message: string }> = [],
): ErrorResponse => errorResponse(message, errors.length ? errors : undefined);
