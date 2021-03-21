import cogoToast from "cogo-toast";

const defaultOptions = {hideAfter: 3, position: 'top-left'}

class ToastFactory {
  private message: string;
  private options: Object;
  constructor(message: string, options: Object = defaultOptions) {
    this.message = message;
    this.options = options
  }
  showError() {
    return cogoToast.error(this.message, this.options)
  }
  showSuccess() {
    return cogoToast.success(this.message, this.options)
  }
}

export const passwordError = new ToastFactory('Password must contain !@#, lowercase and uppercase letters and at least one number');
export const shortPasswordError = new ToastFactory("Password must be longer than 8 characters!")
export const accountCreationFailed = new ToastFactory("Failed to crate an account! Try again later!")
export const accountCreated = new ToastFactory('Your account was created!')
export default ToastFactory
