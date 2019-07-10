import Config from 'react-native-config';
const GIPHY_API_KEY = Config.GIPHY_API_KEY;
const giphy = require('giphy-api')(GIPHY_API_KEY);

const searchGifs = async (query) => {
  const res = await giphy.search(query);
  const gifs = res.data.map((item) => {
    return {
      id: item.id,
      url: item.images.preview_gif.url
    };
  });
  return gifs;
}

export default searchGifs;