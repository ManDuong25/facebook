import React from 'react';
import { getAvatarUrl, handleImageError } from '../../utils/avatarUtils';

const IncomingCallModal = ({ caller, onAccept, onReject }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                        <img
                            src={getAvatarUrl(caller?.avatar)}
                            alt={caller?.name}
                            className="w-full h-full rounded-full object-cover"
                            onError={handleImageError}
                        />
                        <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-pulse"></div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Cuộc gọi video đến</h2>
                    <p className="text-gray-600 mb-6">{caller?.name} đang gọi cho bạn</p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={onAccept}
                            className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors"
                        >
                            <i className="bi bi-telephone-fill mr-2"></i>
                            Trả lời
                        </button>
                        <button
                            onClick={onReject}
                            className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                            <i className="bi bi-telephone-x-fill mr-2"></i>
                            Từ chối
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallModal;
