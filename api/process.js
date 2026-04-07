import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { videoUrl } = req.body;
  try {
    const response = await axios.post('[https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink](https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink)', 
      { url: videoUrl },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'social-download-all-in-one.p.rapidapi.com',
          'x-rapidapi-key': process.env.RAPIDAPI_KEY 
        }
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error API' });
  }
}
