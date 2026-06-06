import { getRandomPoints } from '../utils'

export const mockDestination =
  [
    {
      id: '1',
      description: 'Это место, где можно прикоснуться к прошлому, прогуливаясь по территории кремля.',
      name: 'Ryazan',
      pictures: [
        {
          'src': `https://loremflickr.com/248/152?random=${getRandomPoints()}`,
          'description': 'Описание картинки Рязань'
        }
      ]
    },
    {
      id: '2',
      description: 'это небольшой город с населением около 5-7 тысяч человек,',
      name: 'Spassk',
      pictures: []
    },
    {
      id: '3',
      description: 'Столица нашей родины',
      name: 'Moscow',
      pictures: [
        {
          'src': `https://loremflickr.com/248/152?random=${getRandomPoints()}`,
          'description': 'Описание картинки Москва'
        },
        {
          'src': `https://loremflickr.com/248/152?random=${getRandomPoints()}`,
          'description': 'Описание картинки Москва'
        }
      ]
    }
  ];
