import axios from "axios";

const useServerLog = () => {
  const sl = (message: any) => {
    axios.post('/api/test', { message })
  }
  return { sl }
}

export default useServerLog