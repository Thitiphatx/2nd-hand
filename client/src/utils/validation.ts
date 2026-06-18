import type { Rule } from 'antd/es/form';

/**
 * Common password validation rules for Ant Design Form.Item.
 * Can be used for Login, Register, and Change Password pages.
 * 
 * @param requiredMessage Custom message for required field validation
 * @param checkLength Whether to enforce minimum length of 6 characters (default: true)
 */
export const getPasswordRules = (
  requiredMessage: string = 'Please input your password!',
  checkLength: boolean = true
): Rule[] => {
  const rules: Rule[] = [
    { required: true, message: requiredMessage }
  ];

  if (checkLength) {
    rules.push({ min: 6, message: 'Password must be at least 6 characters!' });
  }

  return rules;
};

/**
 * Common confirm password validation rule for Ant Design Form.Item.
 * Matches the confirm password field with a target password field.
 * 
 * @param passwordFieldName The name of the password field to match against (e.g., 'password' or 'newPassword')
 * @param requiredMessage Custom message for required field validation
 */
export const getConfirmPasswordRules = (
  passwordFieldName: string,
  requiredMessage: string = 'Please confirm your password'
): Rule[] => [
  { required: true, message: requiredMessage },
  ({ getFieldValue }) => ({
    validator(_: any, value: any) {
      if (!value || getFieldValue(passwordFieldName) === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('The two passwords do not match'));
    },
  }),
];
