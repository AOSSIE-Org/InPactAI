import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { MessageSquare, Send } from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const CollaborationMessages = ({
  mockMessages,
  messageStyles,
  messageStyle,
  showStyleOptions,
  setShowStyleOptions,
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleStyleChange,
  customStyle,
  setCustomStyle,
  handleCustomStyle,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Messages
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4 mb-4">
        {mockMessages.map((message) => (
          <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md ${message.isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg p-3`}>
              <div className="text-sm font-medium mb-1">{message.sender}</div>
              <div className="text-sm">{message.content}</div>
              <div className={`text-xs mt-2 ${message.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>{message.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
      <Separator className="my-4" />
      {/* AI Message Style Enhancement */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900">Message Style</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStyleOptions(!showStyleOptions)}
            className="text-xs"
          >
            {messageStyles.find(s => s.value === messageStyle)?.label || "Professional"}
          </Button>
        </div>
        {showStyleOptions && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {messageStyles.map((style) => (
                <Button
                  key={style.value}
                  variant={messageStyle === style.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStyleChange(style.value)}
                  className="text-xs justify-start"
                >
                  {style.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom style (e.g., 'encouraging', 'direct')"
                value={customStyle}
                onChange={(e) => setCustomStyle(e.target.value)}
                className="flex-1 text-xs"
                onKeyPress={(e) => e.key === 'Enter' && handleCustomStyle()}
              />
              <Button size="sm" onClick={handleCustomStyle} className="text-xs">
                Apply
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Textarea
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
          rows={2}
        />
        <Button onClick={handleSendMessage} className="px-4">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default CollaborationMessages; 