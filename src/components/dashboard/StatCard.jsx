import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, gradientClass, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.1 }}
        className={`p-6 rounded-2xl relative overflow-hidden group ${gradientClass}`}
    >
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Icon className="w-24 h-24 transform rotate-12 translate-x-4 -translate-y-4" />
        </div>

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-white/90 text-sm font-medium bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
                        <TrendingUp className="w-3 h-3" />
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>
            <h3 className="text-white/80 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        </div>
    </motion.div>
);

export default StatCard;
