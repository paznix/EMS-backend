import Notification from '../models/notifcationModel.js';

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ to: req.user._id }).populate('from', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .exec();
    
    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching notifications' });
  }
};


const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params; 

    const deletedNotification = await Notification.findByIdAndDelete(id);

    if (!deletedNotification) {
      return res.status(404).json({ success: false, error: "Notification not found" });
    }

    return res.status(200).json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export { getNotifications, deleteNotification };
