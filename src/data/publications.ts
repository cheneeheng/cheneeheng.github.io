export interface Publication {
  title: string;
  venue: string;
  year: number;
  authors: string;
  pdf_url?: string;
  status?: string;
}

export const publications: Publication[] = [
  {
    title:
      'Continuous Risk Estimation of Acute Kidney Failure with Dense Temporal Data for ICU Patients',
    venue:
      '2023 International Conference of the IEEE Engineering in Medicine and Biology Society',
    year: 2023,
    authors:
      'Kai Wu, Ee Heng Chen, Xing Hao, Felix Wirth, Keti Vitanova, Rüdiger Lange, Darius Burschka',
    status: 'Accepted',
  },
  {
    title:
      'Risk Estimation for ICU Patients with Personalized Anomaly-Encoded Bedside Patient Data',
    venue:
      '2023 International Conference of the IEEE Engineering in Medicine and Biology Society',
    year: 2023,
    authors:
      'Kai Wu, Ee Heng Chen, Xing Hao, Felix Wirth, Keti Vitanova, Rüdiger Lange, Darius Burschka',
    status: 'Accepted',
  },
  {
    title:
      'Adaptable Action-Aware Vital Models for Personalized Intelligent Patient Monitoring',
    venue: '2022 IEEE International Conference on Robotics and Automation (ICRA)',
    year: 2022,
    authors:
      'Kai Wu, Ee Heng Chen, Xing Hao, Felix Wirth, Keti Vitanova, Rüdiger Lange, Darius Burschka',
    pdf_url: 'https://ieeexplore.ieee.org/document/9812176',
  },
  {
    title: 'Direct Image Based Traffic Junction Crossing System for Autonomous Vehicles',
    venue:
      '2021 24th IEEE International Conference on Intelligent Transportation (ITSC), pp. 334–340',
    year: 2021,
    authors: 'Ee Heng Chen, Joeran Zeisler, Darius Burschka',
    pdf_url: 'https://ieeexplore.ieee.org/document/9564891',
  },
  {
    title: 'Investigating Binary Neural Networks for Traffic Sign Detection and Recognition',
    venue: '2021 32nd IEEE Intelligent Vehicles Symposium (IV), pp. 1400–1405',
    year: 2021,
    authors:
      'Ee Heng Chen, Manoj Vemparala, Nael Fasfous, Alexander Frickenstein, Ahmed Mzid, Naveen Shankar Nagaraja, Joeran Zeisler, Walter Stechele',
    pdf_url: 'https://ieeexplore.ieee.org/document/9575557',
  },
  {
    title: 'Estimating Dense Optical Flow of Objects for Autonomous Vehicles',
    venue: '2021 32nd IEEE Intelligent Vehicles Symposium (IV), pp. 1393–1399',
    year: 2021,
    authors: 'Ee Heng Chen, Jöran Zeisler, Darius Burschka',
    pdf_url: 'https://ieeexplore.ieee.org/document/9575471',
  },
  {
    title: 'Pixelwise Traffic Junction Segmentation for Urban Scene Understanding',
    venue:
      '2020 IEEE 23rd International Conference on Intelligent Transportation Systems (ITSC), pp. 1–8',
    year: 2020,
    authors: 'Ee Heng Chen, Hanbo Hu, Jöran Zeisler, Darius Burschka',
    pdf_url: 'https://ieeexplore.ieee.org/abstract/document/9294654',
  },
  {
    title: 'Investigating Low Level Features in CNN for Traffic Sign Detection and Recognition',
    venue: '2019 IEEE Intelligent Transportation Systems Conference (ITSC), pp. 325–332',
    year: 2019,
    authors: 'Ee Heng Chen, Philipp Röthig, Jöran Zeisler, Darius Burschka',
    pdf_url: 'https://ieeexplore.ieee.org/abstract/document/8917340',
  },
  {
    title: 'Object-Centric Approach to Prediction and Labeling of Manipulation Tasks',
    venue: '2018 IEEE International Conference on Robotics and Automation (ICRA), pp. 6931–6938',
    year: 2018,
    authors: 'Ee Heng Chen, Darius Burschka',
    pdf_url: 'https://ieeexplore.ieee.org/abstract/document/8462973',
  },
];
