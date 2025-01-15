'use client'

import {useState, useEffect} from 'react'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Textarea} from "@/components/ui/textarea"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Label} from "@/components/ui/label"
import {ThemeToggle} from "@/components/theme-toggle"
import {Logo} from "@/components/logo"
import {Copy, Plus} from 'lucide-react'
import './globals.css'

import {config} from 'dotenv';

type LanguageEntry = {
    languageKey: string
    messageKey: string
    messageValue: string
}

const predefinedLanguages = ['en', 'de', 'fr', 'es', 'it']

export default function LanguageSystem() {
    const [entries, setEntries] = useState<LanguageEntry[]>([])
    const [newLanguage, setNewLanguage] = useState('')
    const [selectedLanguage, setSelectedLanguage] = useState('')
    const [messageKey, setMessageKey] = useState('')
    const [messageValue, setMessageValue] = useState('')
    const [sqlOutput, setSqlOutput] = useState('')
    const [jsonOutput, setJsonOutput] = useState('')
    const [showJsonOutput, setShowJsonOutput] = useState(false)
    const [isNewLanguageDialogOpen, setIsNewLanguageDialogOpen] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
    const [importJson, setImportJson] = useState('')
    const [searchTerm, setSearchTerm] = useState('');

    config();

    useEffect(() => {
        const savedEntries = localStorage.getItem('languageEntries')
        if (savedEntries) {
            setEntries(JSON.parse(savedEntries))
        }
        const savedLoginState = localStorage.getItem('isLoggedIn')
        if (savedLoginState === 'true') {
            setIsLoggedIn(true)
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('languageEntries', JSON.stringify(entries))
    }, [entries])

    useEffect(() => {
        localStorage.setItem('isLoggedIn', isLoggedIn.toString())
    }, [isLoggedIn])

    const login = () => {
        if (username === process.env.ADMIN_USERNAM && password === process.env.ADMIN_USERNAM) {
            setIsLoggedIn(true);
        } else {
            alert('Invalid credentials');
        }
    }

    const logout = () => {
        setIsLoggedIn(false)
        localStorage.removeItem('isLoggedIn')
    }

    const addEntry = () => {
        const languageKey = selectedLanguage || newLanguage
        if (languageKey && messageKey && messageValue) {
            setEntries([...entries, {languageKey, messageKey, messageValue}])
            setMessageKey('')
            setMessageValue('')
            setNewLanguage('')
            setIsNewLanguageDialogOpen(false)
        }
    }

    const removeEntry = (index: number) => {
        setEntries(entries.filter((_, i) => i !== index))
    }

    const duplicateEntry = (index: number) => {
        const entryToDuplicate = entries[index]
        setEntries([...entries, {...entryToDuplicate, messageKey: `${entryToDuplicate.messageKey}_copy`}])
    }

    const generateSQL = () => {
        const messageKeySet = new Set<string>();
        for (const entry of entries) {
            if (messageKeySet.has(entry.messageKey)) {
                alert(`Duplicate message key found: ${entry.messageKey}`);
                return;
            }
            messageKeySet.add(entry.messageKey);
        }

        const sql = entries.map(entry =>
            `INSERT INTO \`language_messages\`(\`language_key\`, \`message_key\`, \`message_value\`)
             VALUES ('${entry.languageKey}', '${entry.messageKey}', '${entry.messageValue}');`
        ).join('\n');
        setSqlOutput(sql);
    };

    const generateJSON = () => {
        const messageKeySet = new Set<string>();
        for (const entry of entries) {
            if (messageKeySet.has(entry.messageKey)) {
                alert(`Duplicate message key found: ${entry.messageKey}`);
                return;
            }
            messageKeySet.add(entry.messageKey);
        }
        setJsonOutput(JSON.stringify(entries, null, 2));
        setShowJsonOutput(true);
    }

    const downloadSQL = () => {
        const messageKeySet = new Set<string>();
        for (const entry of entries) {
            if (messageKeySet.has(entry.messageKey)) {
                alert(`Duplicate message key found: ${entry.messageKey}`);
                return;
            }
            messageKeySet.add(entry.messageKey);
        }
        const blob = new Blob([sqlOutput], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'language_entries.sql';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    const importFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const content = e.target?.result
                if (typeof content === 'string') {
                    if (file.name.endsWith('.json')) {
                        importJSON(content)
                    } else if (file.name.endsWith('.sql')) {
                        importSQL(content)
                    }
                }
            }
            reader.readAsText(file)
        }
    }

    const importJSON = (content: string) => {
        try {
            const importedEntries = JSON.parse(content)
            setEntries(importedEntries)
            setIsImportDialogOpen(false)
        } catch (error) {
            alert('Invalid JSON')
        }
    }

    const importSQL = (content: string) => {
        const lines = content.split('\n')
        const importedEntries: LanguageEntry[] = []
        lines.forEach(line => {
            const match = line.match(/INSERT INTO `language_messages`$$`language_key`, `message_key`, `message_value`$$ VALUES $$'(.+)','(.+)','(.+)'$$;/)
            if (match) {
                importedEntries.push({
                    languageKey: match[1],
                    messageKey: match[2],
                    messageValue: match[3]
                })
            }
        })
        setEntries(importedEntries)
        setIsImportDialogOpen(false)
    }

    // if (!isLoggedIn) {
    //     return (
    //         <div className="flex items-center justify-center min-h-screen ">
    //             <Card className="w-[350px]">
    //                 <CardHeader className="space-y-1">
    //                     <div className="flex justify-center items-center py-6">
    //                         <Logo/>
    //                     </div>
    //                     <CardTitle className="text-2xl">Login</CardTitle>
    //                     <CardDescription>Enter your credentials to access the Language System</CardDescription>
    //                 </CardHeader>
    //                 <CardContent>
    //                     <div className="grid w-full items-center gap-4">
    //                         <div className="flex flex-col space-y-1.5">
    //                             <Label htmlFor="username">Username</Label>
    //                             <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)}/>
    //                         </div>
    //                         <div className="flex flex-col space-y-1.5">
    //                             <Label htmlFor="password">Password</Label>
    //                             <Input id="password" type="password" value={password}
    //                                    onChange={(e) => setPassword(e.target.value)}/>
    //                         </div>
    //                         <Button onClick={login}>Login</Button>
    //                     </div>
    //                 </CardContent>
    //             </Card>
    //         </div>
    //     )
    // }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <Logo/>
                <h1 className="text-xl font-semibold mb-2 py-4">Language System</h1>
                <div className="flex items-center space-x-4">
                    <ThemeToggle/>
                    <Button variant="outline" onClick={logout}>Logout</Button>
                </div>

            </div>

            <h2 className="text-xl font-semibold mb-2 py-4">Add New Entry</h2>
            <div className="flex gap-4 mb-4">
                <Dialog open={isNewLanguageDialogOpen} onOpenChange={setIsNewLanguageDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">Add New Language</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Language</DialogTitle>
                        </DialogHeader>
                        <Input
                            placeholder="New language"
                            value={newLanguage}
                            onChange={(e) => setNewLanguage(e.target.value)}
                        />
                        <Button onClick={() => setIsNewLanguageDialogOpen(false)}>Add Language</Button>
                    </DialogContent>
                </Dialog>
                <Select onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select language"/>
                    </SelectTrigger>
                    <SelectContent>
                        {predefinedLanguages.map(lang => (
                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    placeholder="Message key"
                    value={messageKey}
                    onChange={(e) => setMessageKey(e.target.value)}
                />
                <Input
                    placeholder="Message value"
                    value={messageValue}
                    onChange={(e) => setMessageValue(e.target.value)}
                />
                <Button onClick={addEntry}>Add</Button>
            </div>

            <div className="flex justify-between items-center mt-4 mb-2 py-4">
                <h2 className="text-xl font-semibold mb-2">Language Entries</h2>
                <div className="flex items-center gap-4">
                    <Input
                        type="text"
                        placeholder="Search entries..."
                        className="max-w-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Import File</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Import File</DialogTitle>
                            </DialogHeader>
                            <Input type="file" accept=".json,.sql" onChange={importFile}/>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">Import JSON</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Import JSON</DialogTitle>
                            </DialogHeader>
                            <Textarea
                                placeholder="Paste your JSON here"
                                value={importJson}
                                onChange={(e) => setImportJson(e.target.value)}
                                className="min-h-[200px]"
                            />
                            <Button onClick={() => importJSON(importJson)}>Import</Button>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <ScrollArea className="h-[300px] border rounded-md p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Language Key</TableHead>
                            <TableHead>Message Key</TableHead>
                            <TableHead>Message Value</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries
                            .filter(entry =>
                                entry.languageKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                entry.messageKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                entry.messageValue.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((entry, index) => (
                                <TableRow key={index}>
                                    <TableCell>{entry.languageKey}</TableCell>
                                    <TableCell>{entry.messageKey}</TableCell>
                                    <TableCell>{entry.messageValue}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="icon" onClick={() => duplicateEntry(index)}>
                                                <Copy className="h-4 w-4"/>
                                            </Button>
                                            <Button variant="destructive" size="icon"
                                                    onClick={() => removeEntry(index)}>
                                                <Plus className="h-4 w-4 rotate-45"/>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </ScrollArea>

            <h2 className="text-xl font-semibold mt-4 mb-2">Export Options</h2>
            <div className="flex gap-4">
                <Button onClick={downloadSQL}>Download SQL</Button>
                <Button onClick={generateSQL}>Generate SQL</Button>
                <Button onClick={generateJSON}>Generate JSON</Button>
            </div>

            <h3 className="text-lg font-semibold mt-4 mb-2">SQL Output</h3>
            <Textarea value={sqlOutput} readOnly className="h-[200px]"/>

            {showJsonOutput && (
                <>
                    <h3 className="text-lg font-semibold mt-4 mb-2">JSON Output</h3>
                    <Textarea value={jsonOutput} readOnly className="h-[200px]"/>
                </>
            )}
        </div>
    )
}