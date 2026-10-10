import { supabase } from '../index.js';



const getDashboardInfo = async (req, res) => {
  try {
    const { user } = req;
    

    const {data, error} = await supabase
    .from('polls').select
    



  }catch (error) {
    console.error('Error fetching dashboard info:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard info' });
  }
}


export { getDashboardInfo };